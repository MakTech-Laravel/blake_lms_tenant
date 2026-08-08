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

test('the role detail page shows the summary permission coverage and assigned users', function () {
    $role = Role::create(['name' => 'content-publisher', 'guard_name' => 'web']);
    $role->syncPermissions([
        PermissionEnum::POSTS_INDEX->value,
        PermissionEnum::POSTS_CREATE->value,
    ]);

    $holder = User::factory()->platform()->create(['name' => 'Pat Publisher']);
    $holder->assignRole($role);

    $totalPlatformPermissions = count(PermissionEnum::forDomain(PermissionDomain::PLATFORM));

    $this->actingAs($this->admin)
        ->get(route('platform.roles.show', $role))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/roles/show')
                ->where('role.id', $role->id)
                ->where('role.name', 'content-publisher')
                ->where('role.display_name', 'Content Publisher')
                ->where('role.is_system', false)
                ->where('role.scope', 'Global')
                ->where('role.users_count', 1)
                ->where('role.granted_count', 2)
                ->where('role.total_count', $totalPlatformPermissions)
                ->has('permissionGroups')
                ->has('assignedUsers', 1)
                ->where('assignedUsers.0.name', 'Pat Publisher')
                ->where('assignedUsers.0.profile_url', route('platform.people.show', $holder))
        );
});

test('the role detail page lists every permission flagged as granted or not', function () {
    $role = Role::create(['name' => 'post-reader', 'guard_name' => 'web']);
    $role->syncPermissions([PermissionEnum::POSTS_INDEX->value]);

    $this->actingAs($this->admin)
        ->get(route('platform.roles.show', $role))
        ->assertOk()
        ->assertInertia(function (Assert $page) {
            $groups = collect($page->toArray()['props']['permissionGroups']);
            $permissions = $groups->flatMap(fn (array $group): array => $group['permissions']);

            expect($permissions)->toHaveCount(
                count(PermissionEnum::forDomain(PermissionDomain::PLATFORM))
            );

            $granted = $permissions->where('granted', true);

            expect($granted)->toHaveCount(1)
                ->and($granted->first()['name'])->toBe(PermissionEnum::POSTS_INDEX->value)
                ->and($granted->first()['label'])->not->toBe('');

            $postsGroup = $groups->firstWhere('group', 'Posts');

            expect($postsGroup['granted_count'])->toBe(1)
                ->and($postsGroup['total'])->toBeGreaterThan(1);
        });
});

test('the super admin role detail reports every permission as granted', function () {
    $role = Role::findByName(RoleEnum::SUPER_ADMIN->value);
    $total = count(PermissionEnum::forDomain(PermissionDomain::PLATFORM));

    $this->actingAs($this->admin)
        ->get(route('platform.roles.show', $role))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->where('role.is_system', true)
                ->where('role.granted_count', $total)
                ->where('role.total_count', $total)
                ->where('role.display_name', 'Super Admin')
        );
});

test('the role detail page requires the roles view permission', function () {
    $role = Role::findByName(RoleEnum::EDITOR->value);
    $viewer = User::factory()->platform()->create();
    $viewer->givePermissionTo(PermissionEnum::ROLES_INDEX->value);

    $this->actingAs($viewer)
        ->get(route('platform.roles.show', $role))
        ->assertForbidden();
});

test('the role detail page rejects a role outside the platform team', function () {
    $schoolRole = Role::create([
        'name' => 'school-only',
        'guard_name' => 'web',
        'school_id' => 99,
    ]);

    $this->actingAs($this->admin)
        ->get(route('platform.roles.show', $schoolRole))
        ->assertNotFound();
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
