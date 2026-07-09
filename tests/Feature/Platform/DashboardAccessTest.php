<?php

use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('platform staff can view the platform dashboard', function () {
    $this->actingAs(User::factory()->platform()->create())
        ->get(route('platform.dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('platform/dashboard')
            ->has('stats')
        );
});

test('school staff and teachers cannot view the platform dashboard', function () {
    $school = School::factory()->create();

    $this->actingAs(User::factory()->schoolStaff($school)->create())
        ->get(route('platform.dashboard'))->assertForbidden();

    $this->actingAs(User::factory()->teacher()->create())
        ->get(route('platform.dashboard'))->assertForbidden();
});

test('guests are redirected to login from the platform dashboard', function () {
    $this->get(route('platform.dashboard'))->assertRedirect(route('login'));
});
