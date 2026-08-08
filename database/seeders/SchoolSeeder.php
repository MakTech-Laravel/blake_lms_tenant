<?php

namespace Database\Seeders;

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Enums\UserType;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Two demo schools, each with its own team-scoped roles (super-admin, admin,
 * manager) and head-office staff. Branch-pinned managers are seeded separately
 * by BranchSeeder and reuse the same school-scoped `manager` role.
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
        foreach ($this->schools() as $data) {
            $school = School::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                    'is_active' => true,
                ],
            );

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
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);

        $this->command->info('Schools: '.count($this->schools()).' seeded with staff.');
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
     * @return array<int, array{name: string, slug: string, email: string, phone: string, address: string, staff: array<int, array{name: string, email: string, role: string}>}>
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
                'staff' => [
                    ['name' => 'School Super Admin', 'email' => 'school.superadmin2@dev.com', 'role' => RoleEnum::SUPER_ADMIN->value],
                    ['name' => 'School Admin', 'email' => 'school.admin2@dev.com', 'role' => RoleEnum::ADMIN->value],
                    ['name' => 'School Manager', 'email' => 'school.manager2@dev.com', 'role' => RoleEnum::MANAGER->value],
                ],
            ],
        ];
    }
}
