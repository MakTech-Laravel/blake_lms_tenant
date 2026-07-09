<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Support\PlatformTeamResolver;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $created = 0;
        $updated = 0;

        foreach (RoleEnum::cases() as $roleEnum) {
            $role = Role::firstOrCreate(
                ['name' => $roleEnum->value, 'school_id' => PlatformTeamResolver::PLATFORM_TEAM_ID],
                ['guard_name' => $roleEnum->guard()]
            );
            $isNew = $role->wasRecentlyCreated;

            // super-admin: no permissions assigned — Gate::before handles it
            if ($roleEnum === RoleEnum::SUPER_ADMIN) {
                $this->command->warn(
                    '  [super-admin] Skipping permission assignment — handled by Gate::before.'
                );
                $isNew ? $created++ : $updated++;

                continue;
            }

            // Convert Permissions[] cases to string values for syncPermissions
            $permissionValues = array_map(
                fn ($p) => $p->value,
                $roleEnum->permissions()
            );

            $role->syncPermissions($permissionValues);

            $isNew ? $created++ : $updated++;

            $this->command->line(
                "  {$roleEnum->value}: ".count($permissionValues).' permissions assigned.'
            );
        }

        $this->command->info("Roles: {$created} created, {$updated} updated.");
    }
}
