<?php

use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use App\Models\User;
use Database\Seeders\BranchSeeder;
use Database\Seeders\CourseSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SchoolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Exercises the seeded demo data end to end, so the scenario described in the
 * docs and README is actually true of a freshly seeded database rather than only
 * of hand-built factories.
 */
beforeEach(function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);
    $this->seed(SchoolSeeder::class);
    $this->seed(BranchSeeder::class);
    $this->seed(CourseSeeder::class);

    $this->riverside = School::where('slug', 'riverside-teacher-institute')->firstOrFail();
});

test('riverside is seeded with three branches and summit with one', function () {
    $summit = School::where('slug', 'summit-education-academy')->firstOrFail();

    expect(Branch::where('school_id', $this->riverside->id)->pluck('slug')->sort()->values()->all())
        ->toBe(['barishal', 'khulna', 'rangpur'])
        ->and(Branch::where('school_id', $summit->id)->pluck('slug')->all())
        ->toBe(['main-campus']);
});

test('the seeded school super admin is head office', function () {
    $superAdmin = User::where('email', 'school.superadmin1@dev.com')->firstOrFail();

    expect($superAdmin->branch_id)->toBeNull()
        ->and($superAdmin->isHeadOffice())->toBeTrue();
});

test('each seeded branch manager is pinned to their own branch', function (string $email, string $branchSlug) {
    $manager = User::where('email', $email)->firstOrFail();
    $branch = Branch::where('school_id', $this->riverside->id)->where('slug', $branchSlug)->firstOrFail();

    expect($manager->branch_id)->toBe($branch->id)
        ->and($manager->isHeadOffice())->toBeFalse();

    // The role lives in the school's team, not the branch: branch is not part of
    // the team key, so the role only resolves once the school team is active.
    setPermissionsTeamId($this->riverside->id);

    expect($manager->hasRole('manager'))->toBeTrue();
})->with([
    ['rangpur.manager@dev.com', 'rangpur'],
    ['khulna.manager@dev.com', 'khulna'],
    ['barishal.manager@dev.com', 'barishal'],
]);

test('the seeded rangpur manager sees only rangpur courses', function () {
    $manager = User::where('email', 'rangpur.manager@dev.com')->firstOrFail();

    $this->actingAs($manager);

    expect(Course::where('school_id', $this->riverside->id)->pluck('title')->all())
        ->toBe(['Early Childhood Education Certification']);
});

test('the seeded head office sees every riverside course including the school-wide one', function () {
    $superAdmin = User::where('email', 'school.superadmin1@dev.com')->firstOrFail();

    $this->actingAs($superAdmin);

    $titles = Course::where('school_id', $this->riverside->id)->pluck('title');

    expect($titles)->toHaveCount(4)
        ->and($titles)->toContain('Institute-Wide Teacher Wellbeing Programme');
});

test('the seeded school-wide course belongs to no branch', function () {
    $course = Course::withoutBranchScope()
        ->where('slug', 'institute-wide-teacher-wellbeing-programme')
        ->firstOrFail();

    expect($course->branch_id)->toBeNull();
});

test('a seeded branch manager cannot see another branch course even by id', function () {
    $manager = User::where('email', 'rangpur.manager@dev.com')->firstOrFail();
    $khulnaCourse = Course::withoutBranchScope()
        ->where('slug', 'special-education-endorsement')
        ->firstOrFail();

    $this->actingAs($manager);

    expect(Course::find($khulnaCourse->id))->toBeNull();
});

test('a seeded branch manager cannot manage branches', function () {
    $manager = User::where('email', 'rangpur.manager@dev.com')->firstOrFail();

    $this->actingAs($manager)
        ->get(route('school.branches.index', $this->riverside))
        ->assertForbidden();
});

test('the seeded school admin can open the branches list', function () {
    $admin = User::where('email', 'school.admin1@dev.com')->firstOrFail();

    expect($admin->isHeadOffice())->toBeTrue();

    $this->actingAs($admin)
        ->get(route('school.branches.index', $this->riverside))
        ->assertOk();
});

test('the seeded school admin role carries every school.branches permission', function () {
    setPermissionsTeamId($this->riverside->id);

    $admin = User::where('email', 'school.admin1@dev.com')->firstOrFail();

    foreach ([
        'school.branches.index',
        'school.branches.view',
        'school.branches.create',
        'school.branches.edit',
        'school.branches.delete',
    ] as $permission) {
        expect($admin->can($permission))->toBeTrue("expected admin to have {$permission}");
    }
});

test('the seeded manager role never receives school.branches permissions', function () {
    setPermissionsTeamId($this->riverside->id);

    $manager = User::where('email', 'rangpur.manager@dev.com')->firstOrFail();

    foreach ([
        'school.branches.index',
        'school.branches.create',
        'school.branches.edit',
        'school.branches.delete',
    ] as $permission) {
        expect($manager->can($permission))->toBeFalse("expected manager not to have {$permission}");
    }
});

test('a seeded branch manager can manage staff inside their own branch', function () {
    $manager = User::where('email', 'rangpur.manager@dev.com')->firstOrFail();

    $this->actingAs($manager)
        ->get(route('school.users.index', $this->riverside))
        ->assertOk();

    $this->actingAs($manager)
        ->post(route('school.users.store', $this->riverside), [
            'name' => 'Rangpur Hire',
            'email' => 'rangpur.hire@example.test',
            'password' => 'password123',
            // Even if they try to target another branch, the controller pins them.
            'branch_id' => Branch::where('slug', 'khulna')->value('id'),
        ])
        ->assertRedirect(route('school.users.index', $this->riverside));

    $hire = User::where('email', 'rangpur.hire@example.test')->firstOrFail();

    expect($hire->branch_id)->toBe($manager->branch_id);
});
