<?php

namespace Database\Seeders;

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Enums\SchoolStatus;
use App\Enums\UserType;
use App\Models\Branch;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Fifteen demo organizations for the platform Organizations module.
 *
 * The first two ("Riverside Teacher Institute" and "Summit Education Academy")
 * are the fully wired tenants: each gets its own team-scoped roles (super-admin,
 * admin, manager) and named head-office staff whose passwords match their email,
 * so the school-side dashboards remain usable. Branch-pinned managers are seeded
 * separately by BranchSeeder and reuse the same school-scoped `manager` role.
 *
 * The remaining thirteen exist to populate the Organizations list with realistic
 * regions, statuses, plans, locations, and staff counts. They get anonymous staff
 * and no roles, because nobody signs in as them.
 *
 * Access matrix for the Branches feature:
 *  - super-admin → everything via Gate::before; head office (branch_id NULL)
 *  - admin       → every school-domain permission, including school.branches.*;
 *                  head office, so the Branches nav and CRUD are usable
 *  - manager     → dashboard, staff, locations read, courses, assignments,
 *                  certificates issue/download, reports, notifications, billing view;
 *                  deliberately no school.branches.* — branch structure is head-office only.
 *                  The same role is reused by BranchSeeder's pinned managers.
 */
class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $plans = Plan::get()->keyBy('slug');

        foreach ($this->schools() as $index => $data) {
            $school = School::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'region' => $data['region'],
                    'status' => $data['status'],
                ],
            );

            $this->subscribe($school, $plans, $data, $index);

            if ($data['staff'] === []) {
                $this->anonymousStaff($school, $data['staff_count']);
                $this->demoBranches($school, $data['locations']);

                continue;
            }

            // Scope role creation + assignment to this school's team.
            app(PermissionRegistrar::class)->setPermissionsTeamId($school->id);

            $this->role($school->id, RoleEnum::SUPER_ADMIN->value); // Gate::before grants all
            $this->role($school->id, RoleEnum::ADMIN->value, $this->schoolPermissions());
            $this->role($school->id, RoleEnum::MANAGER->value, $this->managerPermissions());

            foreach ($data['staff'] as $staff) {
                $user = User::updateOrCreate(
                    ['email' => $staff['email']],
                    [
                        'name' => $staff['name'],
                        'password' => Hash::make($staff['email']),
                        'email_verified_at' => now(),
                        'type' => UserType::SCHOOL,
                        'school_id' => $school->id,
                        // Head office: these accounts see every branch. Set
                        // explicitly so re-seeding cannot leave a stale pin
                        // behind. Branch-pinned managers come from BranchSeeder.
                        'branch_id' => null,
                    ],
                );

                $user->syncRoles([$staff['role']]);
            }

            app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        }

        $this->command->info('Schools: '.count($this->schools()).' seeded with staff and subscriptions.');
    }

    /**
     * Give the organization its single subscription.
     *
     * Fixed-price plans always bill their own rate, so `negotiated_price` in the
     * dataset only takes effect on custom-priced plans such as Enterprise. Trial
     * organizations get the plan's default trial length, which in turn derives
     * their trial end and renewal dates.
     *
     * Sign-up dates are staggered by `$index` so the derived renewal dates land
     * on different days instead of all falling one month from the seed run.
     *
     * @param  Collection<string, Plan>  $plans
     * @param  array{plan: string, status: SchoolStatus, negotiated_price: float|null}  $data
     */
    private function subscribe(School $school, Collection $plans, array $data, int $index): void
    {
        $plan = $plans->get($data['plan']);

        if ($plan === null) {
            return;
        }

        $trialDays = $data['status'] === SchoolStatus::Trial ? $plan->trial_days : 0;

        Subscription::updateOrCreate(
            ['school_id' => $school->id],
            [
                'plan_id' => $plan->id,
                'monthly_price' => $plan->rateFor($data['negotiated_price']),
                'canceled_at' => null,
                ...Subscription::scheduleFromTrialDays(
                    $trialDays,
                    now()->subDays($index * 2),
                ),
            ],
        );
    }

    /**
     * Staff rows that exist only to give the Organizations list a realistic
     * headcount. They hold no roles and cannot sign in usefully.
     */
    private function anonymousStaff(School $school, int $count): void
    {
        $existing = User::where('school_id', $school->id)->count();

        if ($existing >= $count) {
            return;
        }

        User::factory()
            ->count($count - $existing)
            ->schoolStaff($school)
            ->create();
    }

    /**
     * Locations for the demo organizations, so the Locations column is not all
     * zeroes. The two wired tenants get their branches from BranchSeeder.
     */
    private function demoBranches(School $school, int $count): void
    {
        $existing = $school->branches()->count();

        for ($index = $existing; $index < $count; $index++) {
            $name = fake()->city().' Centre';

            Branch::updateOrCreate(
                ['school_id' => $school->id, 'slug' => Str::slug($name).'-'.($index + 1)],
                [
                    'name' => $name,
                    'email' => fake()->companyEmail(),
                    'phone' => fake()->phoneNumber(),
                    'address' => fake()->address(),
                    'is_active' => true,
                ],
            );
        }
    }

    /**
     * Find-or-create a team-scoped role and (optionally) sync its permissions.
     *
     * @param  array<int, string>|null  $permissions
     */
    private function role(int $schoolId, string $name, ?array $permissions = null): void
    {
        $role = Role::where('name', $name)->where('school_id', $schoolId)->first()
            ?? Role::create(['name' => $name, 'guard_name' => 'web', 'school_id' => $schoolId]);

        if ($permissions !== null) {
            $role->syncPermissions($permissions);
        }
    }

    /**
     * Every school-domain permission (for the school admin role).
     *
     * Includes school.branches.* automatically whenever those cases are added
     * to PermissionEnum::domain()'s SCHOOL arm — no separate list to keep in sync.
     *
     * @return array<int, string>
     */
    private function schoolPermissions(): array
    {
        return array_map(
            fn (PermissionEnum $permission): string => $permission->value,
            PermissionEnum::forDomain(PermissionDomain::SCHOOL),
        );
    }

    /**
     * Operational permissions for the school manager role.
     *
     * Managers (both head-office and branch-pinned) can list/view courses and
     * manage staff inside the scope their branch_id allows. They never receive
     * school.branches.* — changing the branch structure is a head-office action
     * gated separately by the `head_office` middleware.
     *
     * @return array<int, string>
     */
    private function managerPermissions(): array
    {
        return [
            PermissionEnum::SCHOOL_DASHBOARD_VIEW->value,
            PermissionEnum::SCHOOL_STAFF_INDEX->value,
            PermissionEnum::SCHOOL_STAFF_VIEW->value,
            PermissionEnum::SCHOOL_STAFF_CREATE->value,
            PermissionEnum::SCHOOL_STAFF_EDIT->value,
            PermissionEnum::SCHOOL_LOCATIONS_INDEX->value,
            PermissionEnum::SCHOOL_LOCATIONS_VIEW->value,
            PermissionEnum::SCHOOL_COURSES_INDEX->value,
            PermissionEnum::SCHOOL_COURSES_VIEW->value,
            PermissionEnum::SCHOOL_ASSIGNMENTS_INDEX->value,
            PermissionEnum::SCHOOL_ASSIGNMENTS_VIEW->value,
            PermissionEnum::SCHOOL_ASSIGNMENTS_CREATE->value,
            PermissionEnum::SCHOOL_ASSIGNMENTS_EDIT->value,
            PermissionEnum::SCHOOL_CERTIFICATES_INDEX->value,
            PermissionEnum::SCHOOL_CERTIFICATES_VIEW->value,
            PermissionEnum::SCHOOL_CERTIFICATES_ISSUE->value,
            PermissionEnum::SCHOOL_CERTIFICATES_DOWNLOAD->value,
            PermissionEnum::SCHOOL_REPORTS_INDEX->value,
            PermissionEnum::SCHOOL_REPORTS_VIEW->value,
            PermissionEnum::SCHOOL_NOTIFICATIONS_INDEX->value,
            PermissionEnum::SCHOOL_NOTIFICATIONS_VIEW->value,
            PermissionEnum::SCHOOL_BILLING_VIEW->value,
        ];
    }

    /**
     * Fifteen organizations: 9 active, 3 on trial, 3 suspended. Only the first
     * two carry named staff; the rest report a headcount via `staff_count`.
     *
     * @return array<int, array{
     *     name: string,
     *     slug: string,
     *     email: string,
     *     phone: string,
     *     address: string,
     *     region: string,
     *     status: SchoolStatus,
     *     plan: string,
     *     negotiated_price: float|null,
     *     locations: int,
     *     staff_count: int,
     *     staff: array<int, array{name: string, email: string, role: string}>
     * }>
     */
    private function schools(): array
    {
        return [
            [
                'name' => 'Riverside Teacher Institute',
                'slug' => 'riverside-teacher-institute',
                'email' => 'office@riverside-institute.test',
                'phone' => '+1 (415) 555-0182',
                'address' => '480 Riverside Drive, Sacramento, CA',
                'region' => 'North America',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-training-content',
                'negotiated_price' => null,
                'locations' => 0,
                'staff_count' => 0,
                'staff' => [
                    ['name' => 'School Super Admin', 'email' => 'school.superadmin1@dev.com', 'role' => RoleEnum::SUPER_ADMIN->value],
                    ['name' => 'School Admin', 'email' => 'school.admin1@dev.com', 'role' => RoleEnum::ADMIN->value],
                    ['name' => 'School Manager', 'email' => 'school.manager1@dev.com', 'role' => RoleEnum::MANAGER->value],
                ],
            ],
            [
                'name' => 'Summit Education Academy',
                'slug' => 'summit-education-academy',
                'email' => 'hello@summit-academy.test',
                'phone' => '+1 (312) 555-0147',
                'address' => '1200 Summit Avenue, Chicago, IL',
                'region' => 'North America',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 0,
                'staff_count' => 0,
                'staff' => [
                    ['name' => 'School Super Admin', 'email' => 'school.superadmin2@dev.com', 'role' => RoleEnum::SUPER_ADMIN->value],
                    ['name' => 'School Admin', 'email' => 'school.admin2@dev.com', 'role' => RoleEnum::ADMIN->value],
                    ['name' => 'School Manager', 'email' => 'school.manager2@dev.com', 'role' => RoleEnum::MANAGER->value],
                ],
            ],
            [
                'name' => 'Blue Wave Swim Academy',
                'slug' => 'blue-wave-swim-academy',
                'email' => 'office@bluewave-swim.test',
                'phone' => '+1 (206) 555-0110',
                'address' => '18 Harbour Road, Seattle, WA',
                'region' => 'North America',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 1,
                'staff_count' => 8,
                'staff' => [],
            ],
            [
                'name' => 'Coral Reef Aquatics',
                'slug' => 'coral-reef-aquatics',
                'email' => 'hello@coralreef-aquatics.test',
                'phone' => '+44 20 7946 0221',
                'address' => '44 Kingsway, London',
                'region' => 'Europe',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-training-content',
                'negotiated_price' => null,
                'locations' => 4,
                'staff_count' => 25,
                'staff' => [],
            ],
            [
                'name' => 'Dolphin Dive School',
                'slug' => 'dolphin-dive-school',
                'email' => 'admin@dolphindive.test',
                'phone' => '+65 6555 0134',
                'address' => '9 Marina Boulevard, Singapore',
                'region' => 'Asia Pacific',
                'status' => SchoolStatus::Active,
                'plan' => 'enterprise',
                'negotiated_price' => 1990.00,
                'locations' => 7,
                'staff_count' => 42,
                'staff' => [],
            ],
            [
                'name' => 'Tidal Swim Co',
                'slug' => 'tidal-swim-co',
                'email' => 'team@tidalswim.test',
                'phone' => '+971 4 555 0198',
                'address' => '77 Jumeirah Beach Road, Dubai',
                'region' => 'Middle East',
                'status' => SchoolStatus::Trial,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 10,
                'staff_count' => 59,
                'staff' => [],
            ],
            [
                'name' => 'Splash Zone Centers',
                'slug' => 'splash-zone-centers',
                'email' => 'office@splashzone.test',
                'phone' => '+61 2 5550 0177',
                'address' => '300 George Street, Sydney',
                'region' => 'Oceania',
                'status' => SchoolStatus::Suspended,
                'plan' => 'lms-training-content',
                'negotiated_price' => null,
                'locations' => 1,
                'staff_count' => 12,
                'staff' => [],
            ],
            [
                'name' => 'Marlin Swim Institute',
                'slug' => 'marlin-swim-institute',
                'email' => 'hello@marlinswim.test',
                'phone' => '+1 (305) 555-0163',
                'address' => '620 Biscayne Way, Miami, FL',
                'region' => 'North America',
                'status' => SchoolStatus::Active,
                'plan' => 'enterprise',
                'negotiated_price' => 1990.00,
                'locations' => 4,
                'staff_count' => 33,
                'staff' => [],
            ],
            [
                'name' => 'Riptide Aquatic Group',
                'slug' => 'riptide-aquatic-group',
                'email' => 'contact@riptide-aquatic.test',
                'phone' => '+34 91 555 0142',
                'address' => '12 Calle Mayor, Madrid',
                'region' => 'Europe',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 7,
                'staff_count' => 30,
                'staff' => [],
            ],
            [
                'name' => 'Aqua Tots Network',
                'slug' => 'aqua-tots-network',
                'email' => 'office@aquatots-network.test',
                'phone' => '+81 3 5550 0119',
                'address' => '2-4 Marunouchi, Tokyo',
                'region' => 'Asia Pacific',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-training-content',
                'negotiated_price' => null,
                'locations' => 10,
                'staff_count' => 47,
                'staff' => [],
            ],
            [
                'name' => 'Harbor Aquatics',
                'slug' => 'harbor-aquatics',
                'email' => 'hello@harbor-aquatics.test',
                'phone' => '+1 (617) 555-0155',
                'address' => '15 Seaport Lane, Boston, MA',
                'region' => 'North America',
                'status' => SchoolStatus::Active,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 3,
                'staff_count' => 19,
                'staff' => [],
            ],
            [
                'name' => 'Pacific Swim Collective',
                'slug' => 'pacific-swim-collective',
                'email' => 'team@pacificswim.test',
                'phone' => '+64 9 555 0188',
                'address' => '40 Quay Street, Auckland',
                'region' => 'Oceania',
                'status' => SchoolStatus::Trial,
                'plan' => 'lms-training-content',
                'negotiated_price' => null,
                'locations' => 2,
                'staff_count' => 9,
                'staff' => [],
            ],
            [
                'name' => 'Lakeside Swim Club',
                'slug' => 'lakeside-swim-club',
                'email' => 'office@lakeside-swim.test',
                'phone' => '+49 30 5550 0126',
                'address' => '8 Unter den Linden, Berlin',
                'region' => 'Europe',
                'status' => SchoolStatus::Trial,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 1,
                'staff_count' => 6,
                'staff' => [],
            ],
            [
                'name' => 'Coastal Swim Academy',
                'slug' => 'coastal-swim-academy',
                'email' => 'hello@coastal-swim.test',
                'phone' => '+27 21 555 0173',
                'address' => '5 Beach Road, Cape Town',
                'region' => 'Middle East',
                'status' => SchoolStatus::Suspended,
                'plan' => 'lms-only',
                'negotiated_price' => null,
                'locations' => 2,
                'staff_count' => 14,
                'staff' => [],
            ],
            [
                'name' => 'Sunset Swim School',
                'slug' => 'sunset-swim-school',
                'email' => 'admin@sunset-swim.test',
                'phone' => '+1 (323) 555-0191',
                'address' => '900 Sunset Boulevard, Los Angeles, CA',
                'region' => 'North America',
                'status' => SchoolStatus::Suspended,
                'plan' => 'enterprise',
                'negotiated_price' => 1990.00,
                'locations' => 5,
                'staff_count' => 21,
                'staff' => [],
            ],
        ];
    }
}
