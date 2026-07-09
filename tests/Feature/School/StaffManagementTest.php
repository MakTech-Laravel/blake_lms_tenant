<?php

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

    // Set the active team so the school super-admin role + assignment are
    // recorded against this school.
    setPermissionsTeamId($this->school->id);

    $this->superRole = Role::create([
        'name' => 'super-admin',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);

    $this->admin = User::factory()->schoolStaff($this->school)->create();
    $this->admin->assignRole($this->superRole);
});

test('guests cannot access school staff management', function () {
    $this->get(route('school.users.index', $this->school))
        ->assertRedirect(route('login'));
});

test('a school user without permission is forbidden', function () {
    $user = User::factory()->schoolStaff($this->school)->create();

    $this->actingAs($user)
        ->get(route('school.users.index', $this->school))
        ->assertForbidden();
});

test('a school super-admin can view the staff list', function () {
    $this->actingAs($this->admin)
        ->get(route('school.users.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/users/index')
            ->has('users.data')
        );
});

test('staff can be created within the school', function () {
    $role = Role::create([
        'name' => 'manager',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);

    $this->actingAs($this->admin)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Nadia Rahman',
            'email' => 'nadia@school.test',
            'password' => 'password123',
            'roles' => [$role->name],
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    $user = User::where('email', 'nadia@school.test')->sole();

    expect($user->type->value)->toBe('school')
        ->and($user->school_id)->toBe($this->school->id)
        ->and($user->hasRole('manager'))->toBeTrue();
});

test('a school admin cannot access another school', function () {
    $other = School::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('school.users.index', $other))
        ->assertForbidden();
});

test('staff cannot be assigned another school\'s role', function () {
    $other = School::factory()->create();
    $otherRole = Role::create([
        'name' => 'intruder',
        'guard_name' => 'web',
        'school_id' => $other->id,
    ]);

    $this->actingAs($this->admin)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Cross Tenant',
            'email' => 'cross@school.test',
            'password' => 'password123',
            'roles' => [$otherRole->name],
        ])
        ->assertSessionHasErrors('roles.0');

    expect(User::where('email', 'cross@school.test')->exists())->toBeFalse();
});
