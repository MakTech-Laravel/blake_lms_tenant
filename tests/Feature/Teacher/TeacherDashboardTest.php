<?php

use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('a teacher sees the teacher dashboard at /dashboard', function () {
    $this->actingAs(User::factory()->teacher()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/dashboard')
            ->has('stats')
        );
});

test('a platform user is redirected from /dashboard to the platform dashboard', function () {
    $this->actingAs(User::factory()->platform()->create())
        ->get(route('dashboard'))
        ->assertRedirect(route('platform.dashboard'));
});

test('a school user is redirected from /dashboard to their school dashboard', function () {
    $school = School::factory()->create();
    $user = User::factory()->schoolStaff($school)->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('school.dashboard', $school));
});

test('a teacher can view their courses and certificates', function () {
    $teacher = User::factory()->teacher()->create();

    $this->actingAs($teacher)
        ->get(route('teacher.courses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/courses/index')
            ->has('enrollments')
        );

    $this->actingAs($teacher)
        ->get(route('teacher.certificates.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('teacher/certificates/index')
            ->has('certificates')
        );
});

test('non-teachers cannot access teacher course routes', function () {
    $this->actingAs(User::factory()->platform()->create())
        ->get(route('teacher.courses.index'))->assertForbidden();

    $school = School::factory()->create();
    $this->actingAs(User::factory()->schoolStaff($school)->create())
        ->get(route('teacher.certificates.index'))->assertForbidden();
});
