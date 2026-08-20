<?php

use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('platform dashboard renders aqua cert overview', function () {
    $user = platformSuperAdmin();

    $this->actingAs($user)
        ->get(route('platform.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/dashboard'));
});

test('platform locations static page renders', function () {
    $user = platformSuperAdmin();

    $this->actingAs($user)
        ->get(route('platform.locations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/locations/index'));
});

test('school dashboard renders aqua cert overview', function () {
    $school = School::factory()->create();
    $user = schoolSuperAdmin($school);

    $this->actingAs($user)
        ->get(route('school.dashboard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/dashboard'));
});

test('school static people page renders', function () {
    $school = School::factory()->create();
    $user = schoolSuperAdmin($school);

    $this->actingAs($user)
        ->get(route('school.people.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/people/index'));
});

test('school course wizard renders', function () {
    $school = School::factory()->create();
    $user = schoolSuperAdmin($school);

    $this->actingAs($user)
        ->get(route('school.courses.wizard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/course-wizard'));
});

test('teacher dashboard and learning pages render', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('teacher/dashboard'));

    $this->actingAs($user)
        ->get(route('teacher.learning.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('teacher/my-learning'));
});
