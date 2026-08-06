<?php

use App\Enums\PermissionEnum;
use App\Enums\UserType;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->withoutVite();
});

test('platform locations require the locations index permission', function () {
    $allowed = platformUserWithPermissions([PermissionEnum::PLATFORM_LOCATIONS_INDEX]);
    $denied = User::factory()->platform()->create();

    $this->actingAs($allowed)
        ->get(route('platform.locations.index'))
        ->assertOk();

    $this->actingAs($denied)
        ->get(route('platform.locations.index'))
        ->assertForbidden();
});

test('platform certificate download requires permission', function () {
    Storage::fake('local');
    CertificateTemplate::factory()->default()->create();

    $certificate = Certificate::factory()->create();
    $denied = User::factory()->platform()->create();
    $allowed = platformUserWithPermissions([PermissionEnum::PLATFORM_CERTIFICATES_DOWNLOAD]);

    $this->actingAs($denied)
        ->get(route('platform.certificates.download', $certificate))
        ->assertForbidden();

    $this->actingAs($allowed)
        ->get(route('platform.certificates.download', $certificate))
        ->assertOk()
        ->assertDownload($certificate->certificate_number.'.pdf');
});

test('platform certificate issue requires the issue permission', function () {
    CertificateTemplate::factory()->default()->create();
    $enrollment = CourseEnrollment::factory()->completed()->create();

    $denied = User::factory()->platform()->create();
    $allowed = platformUserWithPermissions([PermissionEnum::PLATFORM_CERTIFICATES_ISSUE]);

    $this->actingAs($denied)
        ->post(route('platform.certificates.store'), [
            'course_enrollment_id' => $enrollment->id,
        ])
        ->assertForbidden();

    $this->actingAs($allowed)
        ->post(route('platform.certificates.store'), [
            'course_enrollment_id' => $enrollment->id,
        ])
        ->assertRedirect();
});

test('platform user show only renders platform accounts', function () {
    $viewer = platformUserWithPermissions([PermissionEnum::USERS_VIEW]);
    $platformUser = User::factory()->platform()->create();
    $schoolUser = User::factory()->schoolStaff(School::factory()->create())->create();

    $this->actingAs($viewer)
        ->get(route('platform.users.show', $platformUser))
        ->assertOk();

    $this->actingAs($viewer)
        ->get(route('platform.users.show', $schoolUser))
        ->assertNotFound();

    expect($schoolUser->type)->toBe(UserType::SCHOOL);
});

test('school locations ui requires school.locations.index', function () {
    $school = School::factory()->create();
    $allowed = schoolStaffWithPermissions($school, [PermissionEnum::SCHOOL_LOCATIONS_INDEX]);
    $denied = User::factory()->schoolStaff($school)->create();

    $this->actingAs($allowed)
        ->get(route('school.locations.ui', $school))
        ->assertOk();

    $this->actingAs($denied)
        ->get(route('school.locations.ui', $school))
        ->assertForbidden();
});

test('school certificate issue requires the issue permission', function () {
    $school = School::factory()->create();
    CertificateTemplate::factory()->default()->create();

    $course = Course::factory()->create(['school_id' => $school->id]);
    $enrollment = CourseEnrollment::factory()->completed()->create([
        'course_id' => $course->id,
    ]);

    $denied = User::factory()->schoolStaff($school)->create();
    $allowed = schoolStaffWithPermissions($school, [PermissionEnum::SCHOOL_CERTIFICATES_ISSUE]);

    $this->actingAs($denied)
        ->post(route('school.certificates.store', $school), [
            'course_enrollment_id' => $enrollment->id,
        ])
        ->assertForbidden();

    $this->actingAs($allowed)
        ->post(route('school.certificates.store', $school), [
            'course_enrollment_id' => $enrollment->id,
        ])
        ->assertRedirect();
});

test('school certificate download is scoped to the school', function () {
    Storage::fake('local');
    CertificateTemplate::factory()->default()->create();

    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();

    $courseA = Course::factory()->create(['school_id' => $schoolA->id]);
    $enrollment = CourseEnrollment::factory()->completed()->create([
        'course_id' => $courseA->id,
    ]);
    $certificate = Certificate::factory()->forEnrollment($enrollment)->create();

    $staffB = schoolStaffWithPermissions($schoolB, [PermissionEnum::SCHOOL_CERTIFICATES_DOWNLOAD]);
    $staffA = schoolStaffWithPermissions($schoolA, [PermissionEnum::SCHOOL_CERTIFICATES_DOWNLOAD]);

    $this->actingAs($staffB)
        ->get(route('school.certificates.download', [$schoolB, $certificate]))
        ->assertForbidden();

    $this->actingAs($staffA)
        ->get(route('school.certificates.download', [$schoolA, $certificate]))
        ->assertOk()
        ->assertDownload($certificate->certificate_number.'.pdf');
});
