<?php

use App\Enums\RoleEnum;
use App\Models\CertificateTemplate;
use App\Models\CourseEnrollment;
use App\Models\School;
use App\Models\User;
use App\Services\Certificates\CertificateGenerator;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('platform module pages render dedicated components', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($user)
        ->get(route('platform.locations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/locations/index'));

    $this->actingAs($user)
        ->get(route('platform.access.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/access/index'));

    $this->actingAs($user)
        ->get(route('platform.certificates.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/certificates/index'));
});

test('platform role create still uses role form page', function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $user = User::factory()->platform()->create();
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    $this->actingAs($user)
        ->get(route('platform.roles.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('platform/roles/create'));
});

test('school module pages render dedicated components', function () {
    $school = School::factory()->create();
    $user = User::factory()->schoolStaff($school)->create();

    $this->actingAs($user)
        ->get(route('school.people.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/people/index'));

    $this->actingAs($user)
        ->get(route('school.access.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('school/access/index'));
});

test('certificate generator creates pdf and preview files', function () {
    Storage::fake('local');

    CertificateTemplate::factory()->default()->create();
    $enrollment = CourseEnrollment::factory()->completed()->create();

    $certificate = app(CertificateGenerator::class)->issue($enrollment);

    expect($certificate->pdf_path)->not->toBeNull()
        ->and($certificate->preview_path)->not->toBeNull()
        ->and(Storage::disk('local')->exists($certificate->pdf_path))->toBeTrue()
        ->and(Storage::disk('local')->exists($certificate->preview_path))->toBeTrue();
});

test('teacher can download own certificate pdf', function () {
    Storage::fake('local');

    CertificateTemplate::factory()->default()->create();
    $teacher = User::factory()->create();
    $enrollment = CourseEnrollment::factory()->completed()->create([
        'user_id' => $teacher->id,
    ]);

    $certificate = app(CertificateGenerator::class)->issue($enrollment);

    $this->actingAs($teacher)
        ->get(route('teacher.certificates.download', $certificate))
        ->assertOk()
        ->assertDownload($certificate->certificate_number.'.pdf');
});

test('teacher cannot download another users certificate', function () {
    Storage::fake('local');

    CertificateTemplate::factory()->default()->create();
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $enrollment = CourseEnrollment::factory()->completed()->create([
        'user_id' => $owner->id,
    ]);

    $certificate = app(CertificateGenerator::class)->issue($enrollment);

    $this->actingAs($other)
        ->get(route('teacher.certificates.download', $certificate))
        ->assertForbidden();
});
