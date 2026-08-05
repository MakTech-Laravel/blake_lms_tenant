<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Enums\UserType;
use App\Models\Branch;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

/**
 * Branches for the demo schools, plus a manager pinned to each.
 *
 * Riverside is the multi-branch case (Rangpur, Khulna, Barishal); Summit is the
 * realistic single-branch case. The school super-admin and admin seeded by
 * SchoolSeeder stay at branch_id NULL — head office, seeing every branch — while
 * the managers created here are pinned and see only their own branch.
 *
 * Note that a pinned manager holds exactly the same school-scoped `manager` role
 * as any other branch's manager. Roles describe what someone may do; the branch
 * decides which records they may do it to.
 */
class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branches = 0;
        $managers = 0;

        foreach ($this->branches() as $schoolSlug => $definitions) {
            $school = School::where('slug', $schoolSlug)->first();

            if ($school === null) {
                continue;
            }

            // Role assignment below must resolve within this school's team.
            app(PermissionRegistrar::class)->setPermissionsTeamId($school->id);

            foreach ($definitions as $definition) {
                $branch = Branch::updateOrCreate(
                    ['school_id' => $school->id, 'slug' => $definition['slug']],
                    [
                        'name' => $definition['name'],
                        'email' => $definition['email'],
                        'phone' => $definition['phone'],
                        'address' => $definition['address'],
                        'is_active' => true,
                    ],
                );
                $branches++;

                $manager = User::updateOrCreate(
                    ['email' => $definition['manager']['email']],
                    [
                        'name' => $definition['manager']['name'],
                        'password' => Hash::make($definition['manager']['email']),
                        'email_verified_at' => now(),
                        'type' => UserType::SCHOOL,
                        'school_id' => $school->id,
                        'branch_id' => $branch->id,
                    ],
                );

                $manager->syncRoles([RoleEnum::MANAGER->value]);
                $managers++;
            }
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);

        $this->command->info("Branches: {$branches} seeded with {$managers} pinned managers.");
    }

    /**
     * @return array<string, array<int, array{name: string, slug: string, email: string, phone: string, address: string, manager: array{name: string, email: string}}>>
     */
    private function branches(): array
    {
        return [
            'riverside-teacher-institute' => [
                [
                    'name' => 'Rangpur',
                    'slug' => 'rangpur',
                    'email' => 'rangpur@riverside-institute.test',
                    'phone' => '+880 1711 000101',
                    'address' => 'Station Road, Rangpur',
                    'manager' => ['name' => 'Rangpur Branch Manager', 'email' => 'rangpur.manager@dev.com'],
                ],
                [
                    'name' => 'Khulna',
                    'slug' => 'khulna',
                    'email' => 'khulna@riverside-institute.test',
                    'phone' => '+880 1711 000102',
                    'address' => 'KDA Avenue, Khulna',
                    'manager' => ['name' => 'Khulna Branch Manager', 'email' => 'khulna.manager@dev.com'],
                ],
                [
                    'name' => 'Barishal',
                    'slug' => 'barishal',
                    'email' => 'barishal@riverside-institute.test',
                    'phone' => '+880 1711 000103',
                    'address' => 'Band Road, Barishal',
                    'manager' => ['name' => 'Barishal Branch Manager', 'email' => 'barishal.manager@dev.com'],
                ],
            ],
            'summit-education-academy' => [
                [
                    'name' => 'Main Campus',
                    'slug' => 'main-campus',
                    'email' => 'campus@summit-academy.test',
                    'phone' => '+1 (312) 555-0148',
                    'address' => '1200 Summit Avenue, Chicago, IL',
                    'manager' => ['name' => 'Main Campus Manager', 'email' => 'campus.manager@dev.com'],
                ],
            ],
        ];
    }
}
