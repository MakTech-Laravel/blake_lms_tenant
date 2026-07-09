<?php

use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Ephemeral routes exercising the tenancy + user-type middleware in isolation,
 * before the real dashboard routes exist.
 */
beforeEach(function () {
    Route::middleware(['web', 'auth', 'type:platform'])
        ->get('/_test/platform', fn () => response('ok'));

    Route::middleware(['web', 'auth', 'tenant', 'type:school'])
        ->get('/_test/school/{school}', fn () => response((string) getPermissionsTeamId()));

    Route::middleware(['web', 'auth', 'tenant'])
        ->get('/_test/tenant-only/{school}', fn () => response((string) getPermissionsTeamId()));
});

test('type:platform admits platform staff and rejects others', function () {
    $school = School::factory()->create();

    $this->actingAs(User::factory()->platform()->create())
        ->get('/_test/platform')->assertOk();

    $this->actingAs(User::factory()->schoolStaff($school)->create())
        ->get('/_test/platform')->assertForbidden();

    $this->actingAs(User::factory()->teacher()->create())
        ->get('/_test/platform')->assertForbidden();
});

test('tenant middleware sets the active team to the resolved school', function () {
    $school = School::factory()->create();

    $this->actingAs(User::factory()->platform()->create())
        ->get("/_test/tenant-only/{$school->slug}")
        ->assertOk()
        ->assertSee((string) $school->id);
});

test('school staff can only reach their own school', function () {
    $schoolA = School::factory()->create();
    $schoolB = School::factory()->create();
    $staffA = User::factory()->schoolStaff($schoolA)->create();

    $this->actingAs($staffA)
        ->get("/_test/school/{$schoolA->slug}")
        ->assertOk()
        ->assertSee((string) $schoolA->id);

    $this->actingAs($staffA)
        ->get("/_test/school/{$schoolB->slug}")
        ->assertForbidden();
});

test('non-school users are rejected from school routes by the type guard', function () {
    $school = School::factory()->create();

    $this->actingAs(User::factory()->platform()->create())
        ->get("/_test/school/{$school->slug}")->assertForbidden();

    $this->actingAs(User::factory()->teacher()->create())
        ->get("/_test/school/{$school->slug}")->assertForbidden();
});

test('an inactive school is rejected by the tenant middleware', function () {
    $school = School::factory()->inactive()->create();

    $this->actingAs(User::factory()->platform()->create())
        ->get("/_test/tenant-only/{$school->slug}")
        ->assertForbidden();
});

test('an unknown school slug returns 404', function () {
    $this->actingAs(User::factory()->platform()->create())
        ->get('/_test/tenant-only/does-not-exist')
        ->assertNotFound();
});
