<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

/**
 * Platform staff — global (school_id NULL) roles.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Platform accounts resolve their roles in the global (NULL) team.
        app(PermissionRegistrar::class)->setPermissionsTeamId(null);

        foreach ($this->users() as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['email']),
                    'email_verified_at' => now(),
                    'type' => UserType::PLATFORM,
                    'school_id' => null,
                ],
            );

            $user->syncRoles([$data['role']]);
        }

        $this->command->info('Platform users: '.count($this->users()).' seeded.');
    }

    /**
     * @return array<int, array{name: string, email: string, role: string}>
     */
    private function users(): array
    {
        return [
            ['name' => 'Super Admin', 'email' => 'superadmin@dev.com', 'role' => RoleEnum::SUPER_ADMIN->value],
            ['name' => 'Admin', 'email' => 'admin@dev.com', 'role' => RoleEnum::ADMIN->value],
            ['name' => 'Manager', 'email' => 'manager@dev.com', 'role' => RoleEnum::MANAGER->value],
        ];
    }
}
