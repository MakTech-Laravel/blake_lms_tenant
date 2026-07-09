<?php

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
});

test('a platform user with the schools permission can view the schools list', function () {
    School::factory()->count(3)->create();

    $role = Role::create(['name' => 'ops', 'guard_name' => 'web']);
    $role->givePermissionTo(PermissionEnum::PLATFORM_SCHOOLS_INDEX->value);

    $user = User::factory()->platform()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('platform.schools.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/schools/index')
            ->has('schools.data', 3)
        );
});

test('a platform user without the schools permission is forbidden', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($user)
        ->get(route('platform.schools.index'))
        ->assertForbidden();
});
