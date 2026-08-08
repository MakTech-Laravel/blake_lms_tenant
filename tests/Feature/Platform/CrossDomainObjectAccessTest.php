<?php

use App\Enums\PermissionEnum;
use App\Models\School;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * The platform user/role routes are permission-gated, but permissions alone do
 * not say WHICH records an actor may touch. Platform staff administer platform
 * accounts and the platform's own roles (team 0) — never a tenant's staff or a
 * tenant's team-scoped roles, even with a forged id.
 */
beforeEach(function () {
    $this->withoutVite();
});

test('platform staff cannot reach a school user through the platform user routes', function () {
    $actor = platformUserWithPermissions([
        PermissionEnum::USERS_VIEW,
        PermissionEnum::USERS_EDIT,
        PermissionEnum::USERS_DELETE,
    ]);

    $school = School::factory()->create();
    $schoolUser = User::factory()->schoolStaff($school)->create();

    $this->actingAs($actor)
        ->get(route('platform.users.show', $schoolUser))
        ->assertNotFound();

    $this->actingAs($actor)
        ->get(route('platform.users.edit', $schoolUser))
        ->assertNotFound();

    $this->actingAs($actor)
        ->put(route('platform.users.update', $schoolUser), [
            'name' => 'Hijacked Name',
            'email' => 'hijacked@example.test',
        ])
        ->assertNotFound();

    $this->actingAs($actor)
        ->delete(route('platform.users.destroy', $schoolUser))
        ->assertNotFound();

    $schoolUser->refresh();

    expect($schoolUser->name)->not->toBe('Hijacked Name')
        ->and($schoolUser->exists)->toBeTrue();
});

test('platform staff cannot modify a school-scoped role through the platform role routes', function () {
    $actor = platformUserWithPermissions([
        PermissionEnum::ROLES_INDEX,
        PermissionEnum::ROLES_EDIT,
        PermissionEnum::ROLES_DELETE,
    ]);

    $school = School::factory()->create();

    $schoolRole = Role::create([
        'name' => 'branch-lead',
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);

    $this->actingAs($actor)
        ->get(route('platform.roles.edit', $schoolRole))
        ->assertNotFound();

    $this->actingAs($actor)
        ->put(route('platform.roles.update', $schoolRole), [
            'name' => 'hijacked-role',
        ])
        ->assertNotFound();

    $this->actingAs($actor)
        ->delete(route('platform.roles.destroy', $schoolRole))
        ->assertNotFound();

    $survivor = Role::find($schoolRole->id);

    expect($survivor)->not->toBeNull()
        ->and($survivor->name)->toBe('branch-lead')
        ->and($survivor->school_id)->toBe($school->id);
});

test('the platform role list never exposes a school-scoped role', function () {
    $actor = platformUserWithPermissions([PermissionEnum::ROLES_INDEX]);

    $school = School::factory()->create();

    Role::create([
        'name' => 'branch-lead',
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);

    $this->actingAs($actor)
        ->get(route('platform.roles.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('platform/roles/index')
            ->where('roles.data', fn ($roles) => collect($roles)
                ->pluck('name')
                ->doesntContain('branch-lead')));
});
