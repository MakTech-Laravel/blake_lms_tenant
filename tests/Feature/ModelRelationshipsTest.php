<?php

use App\Enums\UserType;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\School;
use App\Models\User;

test('a school has courses and staff', function () {
    $school = School::factory()->create();
    $staff = User::factory()->schoolStaff($school)->create();
    $course = Course::factory()->for($school)->create();

    expect($school->users)->toHaveCount(1)
        ->and($school->users->first()->is($staff))->toBeTrue()
        ->and($school->courses)->toHaveCount(1)
        ->and($school->courses->first()->is($course))->toBeTrue()
        ->and($school->is_active)->toBeTrue();
});

test('a course belongs to a school and has enrolled teachers', function () {
    $course = Course::factory()->create();
    $teacher = User::factory()->teacher()->create();

    $enrollment = CourseEnrollment::factory()
        ->for($course)
        ->for($teacher)
        ->create();

    expect($course->school)->toBeInstanceOf(School::class)
        ->and($course->enrollments->first()->is($enrollment))->toBeTrue()
        ->and($course->teachers->first()->is($teacher))->toBeTrue()
        ->and($course->is_published)->toBeTrue();
});

test('a teacher reaches courses and certificates through enrollments', function () {
    $teacher = User::factory()->teacher()->create();
    $course = Course::factory()->create();

    $enrollment = CourseEnrollment::factory()
        ->for($course)
        ->for($teacher)
        ->completed()
        ->create();

    $certificate = Certificate::factory()->forEnrollment($enrollment)->create();

    expect($teacher->isTeacher())->toBeTrue()
        ->and($teacher->type)->toBe(UserType::TEACHER)
        ->and($teacher->courseEnrollments->first()->is($enrollment))->toBeTrue()
        ->and($teacher->enrolledCourses->first()->is($course))->toBeTrue()
        ->and($teacher->certificates->first()->is($certificate))->toBeTrue()
        ->and($certificate->enrollment->is($enrollment))->toBeTrue()
        ->and($certificate->course->is($course))->toBeTrue()
        ->and($enrollment->certificate->is($certificate))->toBeTrue();
});

test('user type helpers reflect the type column', function () {
    $platform = User::factory()->platform()->create();
    $school = School::factory()->create();
    $schoolStaff = User::factory()->schoolStaff($school)->create();
    $teacher = User::factory()->teacher()->create();

    expect($platform->isPlatformStaff())->toBeTrue()
        ->and($platform->school_id)->toBeNull()
        ->and($schoolStaff->isSchoolStaff())->toBeTrue()
        ->and($schoolStaff->school->is($school))->toBeTrue()
        ->and($teacher->isTeacher())->toBeTrue();
});
