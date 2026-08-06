<?php

use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('platform dashboard renders aqua cert overview', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($user)
        ->get(route('platform.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/dashboard'));
});

test('platform organizations static page renders', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($user)
        ->get(route('platform.organizations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/organizations'));
});

test('platform locations static page renders', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($user)
        ->get(route('platform.locations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/static-resource')
            ->where('title', 'Locations'));
});

test('school dashboard renders aqua cert overview', function () {
    $school = School::factory()->create();
    $user = User::factory()->schoolStaff($school)->create();

    $this->actingAs($user)
        ->get(route('school.dashboard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/dashboard'));
});

test('school static people page renders', function () {
    $school = School::factory()->create();
    $user = User::factory()->schoolStaff($school)->create();

    $this->actingAs($user)
        ->get(route('school.people.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/static-resource')
            ->where('title', 'People'));
});

test('school course wizard renders', function () {
    $school = School::factory()->create();
    $user = User::factory()->schoolStaff($school)->create();

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
