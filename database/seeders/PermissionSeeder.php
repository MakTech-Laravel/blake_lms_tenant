<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $created = 0;
        $skipped = 0;

        foreach (PermissionEnum::cases() as $permission) {
            $exists = Permission::where('name', $permission->value)->exists();

            Permission::updateOrCreate(
                ['name' => $permission->value],
                [
                    'guard_name' => $permission->guard(),
                    'group' => $permission->group(),
                    'domain' => $permission->domain()->value,
                ]
            );

            $exists ? $skipped++ : $created++;
        }

        $this->command->info("Permissions: {$created} created, {$skipped} already existed.");
    }
}
