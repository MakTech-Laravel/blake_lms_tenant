<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
*/

/**
 * Platform user with the super-admin role (Gate::before grants everything).
 */
function platformSuperAdmin(): User
{
    test()->seed([PermissionSeeder::class, RoleSeeder::class]);

    $user = User::factory()->platform()->create();
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    return $user;
}

/**
 * School staff with a team-scoped super-admin role for the given school.
 */
function schoolSuperAdmin(School $school): User
{
    test()->seed(PermissionSeeder::class);

    app(PermissionRegistrar::class)->setPermissionsTeamId($school->id);

    $role = Role::query()->firstOrCreate([
        'name' => RoleEnum::SUPER_ADMIN->value,
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);

    $user = User::factory()->schoolStaff($school)->create();
    $user->assignRole($role);

    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    return $user;
}

/**
 * School staff granted specific school-domain permissions for the given school.
 *
 * @param  array<int, PermissionEnum|string>  $permissions
 */
function schoolStaffWithPermissions(School $school, array $permissions): User
{
    test()->seed(PermissionSeeder::class);

    app(PermissionRegistrar::class)->setPermissionsTeamId($school->id);

    $role = Role::create([
        'name' => 'test-school-role-'.uniqid(),
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);

    $names = array_map(
        fn (PermissionEnum|string $permission): string => $permission instanceof PermissionEnum
            ? $permission->value
            : $permission,
        $permissions,
    );

    $role->givePermissionTo($names);

    $user = User::factory()->schoolStaff($school)->create();
    $user->assignRole($role);

    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    return $user;
}

/**
 * Platform user granted specific platform-domain permissions.
 *
 * @param  array<int, PermissionEnum|string>  $permissions
 */
function platformUserWithPermissions(array $permissions): User
{
    test()->seed(PermissionSeeder::class);

    $role = Role::create([
        'name' => 'test-platform-role-'.uniqid(),
        'guard_name' => 'web',
    ]);

    $names = array_map(
        fn (PermissionEnum|string $permission): string => $permission instanceof PermissionEnum
            ? $permission->value
            : $permission,
        $permissions,
    );

    $role->givePermissionTo($names);

    $user = User::factory()->platform()->create();
    $user->assignRole($role);

    return $user;
}
