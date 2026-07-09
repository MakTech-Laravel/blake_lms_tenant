<?php

use App\Models\Course;
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

test('a school super-admin can view their courses', function () {
    Course::factory()->count(2)->create(['school_id' => $this->school->id]);

    // A course belonging to another school must not appear.
    Course::factory()->create(['school_id' => School::factory()->create()->id]);

    $this->actingAs($this->admin)
        ->get(route('school.courses.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/courses/index')
            ->has('courses.data', 2)
        );
});

test('a school user without the courses permission is forbidden', function () {
    $user = User::factory()->schoolStaff($this->school)->create();

    $this->actingAs($user)
        ->get(route('school.courses.index', $this->school))
        ->assertForbidden();
});
