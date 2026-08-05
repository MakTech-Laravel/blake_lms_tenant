<?php

use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->school = School::factory()->create();

    // Set the active team so the school's roles and assignments are recorded
    // against this school. Branch plays no part in the team key.
    setPermissionsTeamId($this->school->id);

    $this->superRole = Role::create([
        'name' => 'super-admin',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);

    $this->rangpur = Branch::factory()->forSchool($this->school)->create(['name' => 'Rangpur']);
    $this->khulna = Branch::factory()->forSchool($this->school)->create(['name' => 'Khulna']);
    $this->barishal = Branch::factory()->forSchool($this->school)->create(['name' => 'Barishal']);

    // Head office: school-wide access, branch_id NULL.
    $this->headOffice = User::factory()->schoolStaff($this->school)->create();
    $this->headOffice->assignRole($this->superRole);

    // Pinned to Rangpur only.
    $this->rangpurManager = User::factory()->branchStaff($this->rangpur)->create();
    $this->rangpurManager->assignRole($this->superRole);
});

test('the branch global scope is a no-op when nobody is authenticated', function () {
    Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();

    // Seeders, queue workers, and console commands must see everything.
    expect(Course::count())->toBe(2);
});

test('a branch-pinned user only sees their own branch courses', function () {
    $rangpurCourse = Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();
    Course::factory()->forBranch($this->barishal)->create();
    // A school-wide course is head-office only under the strict matching rule.
    Course::factory()->create(['school_id' => $this->school->id]);

    $this->actingAs($this->rangpurManager);

    expect(Course::pluck('id')->all())->toBe([$rangpurCourse->id]);
});

test('a branch-pinned user cannot reach another branch record via a forged id', function () {
    $khulnaCourse = Course::factory()->forBranch($this->khulna)->create();

    $this->actingAs($this->rangpurManager);

    expect(Course::find($khulnaCourse->id))->toBeNull()
        ->and(Course::where('id', $khulnaCourse->id)->exists())->toBeFalse();

    // The record still exists — it is scoped away, not missing.
    expect(Course::withoutBranchScope()->find($khulnaCourse->id))->not->toBeNull();
});

test('a head office user sees every branch in their school', function () {
    Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();
    Course::factory()->forBranch($this->barishal)->create();

    $this->actingAs($this->headOffice);

    expect(Course::count())->toBe(3);
});

test('a new record inherits the creating user branch', function () {
    $this->actingAs($this->rangpurManager);

    $course = Course::create([
        'school_id' => $this->school->id,
        'title' => 'Inherited Branch Course',
        'slug' => 'inherited-branch-course',
        'price' => 0,
    ]);

    expect($course->branch_id)->toBe($this->rangpur->id);
});

test('an explicit branch is not overwritten for a head office user', function () {
    $this->actingAs($this->headOffice);

    $course = Course::create([
        'school_id' => $this->school->id,
        'branch_id' => $this->khulna->id,
        'title' => 'Explicit Branch Course',
        'slug' => 'explicit-branch-course',
        'price' => 0,
    ]);

    expect($course->branch_id)->toBe($this->khulna->id);
});

// ── Recursion guard ───────────────────────────────────────────────────────────
//
// The branch scope resolves the current branch from the authenticated user, so
// attaching it to User would make resolving the authenticated user depend on
// itself. These two tests drive a real session login: the *second* request
// rehydrates the user through SessionGuard::user() -> retrieveById(), which is
// the exact path that would recurse. actingAs() cannot prove this, because it
// injects the user into the guard and retrieveById() is never called.

test('a branch-pinned user can be resolved from the session on a later request', function () {
    $this->post(route('login.store'), [
        'email' => $this->rangpurManager->email,
        'password' => 'password',
    ])->assertRedirect();

    $this->assertAuthenticatedAs($this->rangpurManager);

    // Laravel's test harness reuses a single application instance, so the guard
    // still holds the user object resolved during login. Forget the guards to
    // force the next request to rehydrate the user from the session id through
    // retrieveById() — without this the guard returns its cached user and the
    // recursion path is never touched.
    $this->app['auth']->forgetGuards();

    $this->get(route('school.dashboard', $this->school))->assertOk();

    expect(Auth::id())->toBe($this->rangpurManager->id)
        ->and(Auth::user()->branch_id)->toBe($this->rangpur->id);
});

test('resolving a branch-pinned user by id does not consult the branch context', function () {
    // The narrowest possible statement of the invariant: ask the auth provider
    // to load the pinned user directly, with that same user already acting.
    // If User carried the branch global scope this would re-enter the guard.
    $this->actingAs($this->rangpurManager);

    $provider = Auth::createUserProvider('users');

    expect($provider->retrieveById($this->rangpurManager->id)?->id)
        ->toBe($this->rangpurManager->id);

    // A head-office user must remain loadable while a pinned user is active —
    // a branch scope on User would hide every other branch's account, breaking
    // impersonation, notifications, and any lookup by id.
    expect($provider->retrieveById($this->headOffice->id)?->id)
        ->toBe($this->headOffice->id);
});

test('a branch-pinned user can log in end to end', function () {
    // Login itself retrieves the user by credentials while unauthenticated,
    // exercising the provider path before any branch context exists.
    $this->post(route('login.store'), [
        'email' => $this->rangpurManager->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($this->rangpurManager);
});

// ── ResolveTenant branch validation ───────────────────────────────────────────

test('a user pinned to another school branch is rejected', function () {
    $otherSchool = School::factory()->create();
    $foreignBranch = Branch::factory()->forSchool($otherSchool)->create();

    // Corrupt pairing: school staff of this school pinned to another school's
    // branch. ResolveTenant must refuse rather than leak an empty dashboard.
    $user = User::factory()->schoolStaff($this->school)->create([
        'branch_id' => $foreignBranch->id,
    ]);

    $this->actingAs($user)
        ->get(route('school.dashboard', $this->school))
        ->assertForbidden();
});

test('a user pinned to a deactivated branch is rejected', function () {
    $closed = Branch::factory()->forSchool($this->school)->inactive()->create();
    $user = User::factory()->branchStaff($closed)->create();

    $this->actingAs($user)
        ->get(route('school.dashboard', $this->school))
        ->assertForbidden();
});

test('a head office user is unaffected by branch validation', function () {
    $this->actingAs($this->headOffice)
        ->get(route('school.dashboard', $this->school))
        ->assertOk();
});

// ── Scoping through the dashboard and course pages ────────────────────────────

test('dashboard counts are branch scoped', function () {
    Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();
    Course::factory()->forBranch($this->barishal)->create();
    Course::factory()->create(['school_id' => $this->school->id]);

    User::factory()->branchStaff($this->khulna)->create();

    $this->actingAs($this->rangpurManager)
        ->get(route('school.dashboard', $this->school))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.courses', 1)
            // The Rangpur manager themselves, and nobody else.
            ->where('stats.staff', 1)
        );

    $this->actingAs($this->headOffice)
        ->get(route('school.dashboard', $this->school))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.courses', 4)
            ->where('stats.staff', 3)
        );
});

test('the course list only shows the pinned branch courses', function () {
    $mine = Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();

    $this->actingAs($this->rangpurManager)
        ->get(route('school.courses.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('courses.data', 1)
            ->where('courses.data.0.id', $mine->id)
            // No filter options: there is nothing for them to switch between.
            ->has('branches', 0)
        );
});

test('a pinned user cannot widen the course list with the branch filter', function () {
    Course::factory()->forBranch($this->rangpur)->create();
    Course::factory()->forBranch($this->khulna)->create();

    $this->actingAs($this->rangpurManager)
        ->get(route('school.courses.index', [$this->school, 'branch' => $this->khulna->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('courses.data', 1));
});

test('head office can filter courses by branch', function () {
    Course::factory()->forBranch($this->rangpur)->create();
    $khulnaCourse = Course::factory()->forBranch($this->khulna)->create();

    $this->actingAs($this->headOffice)
        ->get(route('school.courses.index', [$this->school, 'branch' => $this->khulna->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('courses.data', 1)
            ->where('courses.data.0.id', $khulnaCourse->id)
        );
});

// ── Shared Inertia branch context ────────────────────────────────────────────

test('the branch context is shared with the frontend', function () {
    $this->actingAs($this->rangpurManager)
        ->get(route('school.dashboard', $this->school))
        ->assertInertia(fn (Assert $page) => $page
            ->where('branch.isHeadOffice', false)
            ->where('branch.pinned.id', $this->rangpur->id)
            ->where('branch.pinned.name', 'Rangpur')
        );

    $this->actingAs($this->headOffice)
        ->get(route('school.dashboard', $this->school))
        ->assertInertia(fn (Assert $page) => $page
            ->where('branch.isHeadOffice', true)
            ->where('branch.pinned', null)
        );
});
