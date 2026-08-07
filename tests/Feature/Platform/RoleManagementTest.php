<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->platform()->create();
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('super admin can view the roles list', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.roles.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/roles/index')
                ->has('roles.data')
        );
});

test('the role editor receives only platform-domain permissions', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.roles.create'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/roles/create')
                ->has('permissions', count(PermissionEnum::forDomain(PermissionDomain::PLATFORM)))
                ->where('permissions.0.label', fn ($label) => is_string($label) && $label !== '')
        );
});

test('roles list supports search filters and pagination meta', function () {
    Role::create(['name' => 'content-publisher', 'guard_name' => 'web']);
    Role::create(['name' => 'billing-analyst', 'guard_name' => 'web']);

    $this->actingAs($this->admin)
        ->get(route('platform.roles.index', ['search' => 'billing']))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/roles/index')
                ->where('filters.search', 'billing')
                ->has('roles.data', 1)
                ->where('roles.data.0.name', 'billing-analyst')
                ->has('roles.links')
                ->where('roles.per_page', 15)
        );
});

test('roles can be filtered by kind', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.roles.index', ['kind' => 'system']))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->where('filters.kind', 'system')
                ->has('roles.data', 1)
                ->where('roles.data.0.name', RoleEnum::SUPER_ADMIN->value)
        );
});

test('roles can be exported as csv', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.roles.export', ['format' => 'csv']))
        ->assertOk()
        ->assertHeader('content-disposition');
});

test('permission labels are human readable', function () {
    expect(PermissionEnum::PLATFORM_ASSESSMENTS_INDEX->label())->toBe('View Assessments')
        ->and(PermissionEnum::PLATFORM_CERTIFICATES_TEMPLATES_MANAGE->label())->toBe('Manage certificate templates')
        ->and(PermissionEnum::labelFor('dashboard.view'))->toBe('View dashboard');
});

test('a role can be created with grouped permissions', function () {
    $permissions = [
        PermissionEnum::POSTS_INDEX->value,
        PermissionEnum::POSTS_VIEW->value,
        PermissionEnum::POSTS_CREATE->value,
    ];

    $this->actingAs($this->admin)
        ->post(route('platform.roles.store'), [
            'name' => 'content-manager',
            'permissions' => $permissions,
        ])
        ->assertRedirect(route('platform.roles.index'));

    $role = Role::findByName('content-manager');

    expect($role->permissions->pluck('name')->all())
        ->toEqualCanonicalizing($permissions)
        ->and((int) $role->school_id)->toBe(0);
});

test('a platform role cannot be assigned school-domain permissions', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.roles.store'), [
            'name' => 'cross-domain',
            'permissions' => [PermissionEnum::SCHOOL_COURSES_INDEX->value],
        ])
        ->assertSessionHasErrors('permissions.0');

    expect(Role::query()->where('name', 'cross-domain')->exists())->toBeFalse();
});

test('the role name is required and reserved names are rejected', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.roles.store'), [
            'name' => RoleEnum::SUPER_ADMIN->value,
            'permissions' => [],
        ])
        ->assertSessionHasErrors('name');
});

test('a role name must be unique', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.roles.store'), [
            'name' => RoleEnum::EDITOR->value,
            'permissions' => [],
        ])
        ->assertSessionHasErrors('name');
});

test('a role permissions can be updated', function () {
    $role = Role::create(['name' => 'temp', 'guard_name' => 'web']);
    $role->givePermissionTo(PermissionEnum::POSTS_VIEW->value);

    $this->actingAs($this->admin)
        ->put(route('platform.roles.update', $role), [
            'name' => 'temp',
            'permissions' => [
                PermissionEnum::POSTS_CREATE->value,
                PermissionEnum::POSTS_EDIT->value,
            ],
        ])
        ->assertRedirect(route('platform.roles.index'));

    expect($role->fresh()->permissions->pluck('name')->all())
        ->toEqualCanonicalizing([
            PermissionEnum::POSTS_CREATE->value,
            PermissionEnum::POSTS_EDIT->value,
        ]);
});

test('the super admin role cannot be deleted', function () {
    $role = Role::findByName(RoleEnum::SUPER_ADMIN->value);

    $this->actingAs($this->admin)
        ->delete(route('platform.roles.destroy', $role))
        ->assertRedirect();

    expect(Role::find($role->id))->not->toBeNull();
});

test('a non-system role can be deleted', function () {
    $role = Role::create(['name' => 'disposable', 'guard_name' => 'web']);

    $this->actingAs($this->admin)
        ->delete(route('platform.roles.destroy', $role))
        ->assertRedirect();

    expect(Role::find($role->id))->toBeNull();
});
