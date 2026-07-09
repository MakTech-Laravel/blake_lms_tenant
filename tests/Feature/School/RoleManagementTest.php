<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->school = School::factory()->create();
    setPermissionsTeamId($this->school->id);

    $this->superRole = Role::create([
        'name' => 'super-admin',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);

    $this->admin = User::factory()->schoolStaff($this->school)->create();
    $this->admin->assignRole($this->superRole);
});

test('a school super-admin can view the roles list', function () {
    $this->actingAs($this->admin)
        ->get(route('school.roles.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/roles/index')
            ->has('roles.data')
        );
});

test('the role editor receives only school-domain permissions', function () {
    $this->actingAs($this->admin)
        ->get(route('school.roles.create', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/roles/create')
            ->has('permissions', count(PermissionEnum::forDomain(PermissionDomain::SCHOOL)))
        );
});

test('a role is created scoped to the school', function () {
    $this->actingAs($this->admin)
        ->post(route('school.roles.store', $this->school), [
            'name' => 'registrar',
            'permissions' => [PermissionEnum::SCHOOL_COURSES_INDEX->value],
        ])
        ->assertRedirect(route('school.roles.index', $this->school));

    $role = Role::where('name', 'registrar')->where('school_id', $this->school->id)->first();

    expect($role)->not->toBeNull()
        ->and($role->school_id)->toBe($this->school->id);
});

test('a school role cannot be assigned platform-domain permissions', function () {
    $this->actingAs($this->admin)
        ->post(route('school.roles.store', $this->school), [
            'name' => 'cross-domain',
            'permissions' => [PermissionEnum::USERS_INDEX->value],
        ])
        ->assertSessionHasErrors('permissions.0');

    expect(Role::where('name', 'cross-domain')->exists())->toBeFalse();
});

test('roles are isolated per school', function () {
    // This school currently has exactly one role (its super-admin). A role
    // created for another school must never appear in this school's list.
    $other = School::factory()->create();
    Role::create(['name' => 'foreign-role', 'guard_name' => 'web', 'school_id' => $other->id]);

    $this->actingAs($this->admin)
        ->get(route('school.roles.index', $this->school))
        ->assertInertia(fn (Assert $page) => $page->has('roles.data', 1));
});
