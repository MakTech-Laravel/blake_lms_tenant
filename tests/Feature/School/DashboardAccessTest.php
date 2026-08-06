<?php

use App\Enums\PermissionEnum;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

test('school staff can view their own school dashboard', function () {
    $school = School::factory()->create();
    $staff = schoolStaffWithPermissions($school, [
        PermissionEnum::SCHOOL_DASHBOARD_VIEW,
    ]);

    $this->actingAs($staff)
        ->get(route('school.dashboard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/dashboard')
            ->has('stats')
            ->where('school.slug', $school->slug)
        );
});

test('school staff without dashboard permission is forbidden', function () {
    $school = School::factory()->create();
    $staff = User::factory()->schoolStaff($school)->create();

    $this->actingAs($staff)
        ->get(route('school.dashboard', $school))
        ->assertForbidden();
});

test('school staff cannot view another school dashboard', function () {
    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();
    $staffA = User::factory()->schoolStaff($schoolA)->create();

    $this->actingAs($staffA)
        ->get(route('school.dashboard', $schoolB))
        ->assertForbidden();
});

test('platform staff and teachers cannot view a school dashboard', function () {
    $school = School::factory()->create();

    $this->actingAs(User::factory()->platform()->create())
        ->get(route('school.dashboard', $school))->assertForbidden();

    $this->actingAs(User::factory()->teacher()->create())
        ->get(route('school.dashboard', $school))->assertForbidden();
});

test('guests are redirected to login from a school dashboard', function () {
    $school = School::factory()->create();

    $this->get(route('school.dashboard', $school))
        ->assertRedirect(route('login'));
});
