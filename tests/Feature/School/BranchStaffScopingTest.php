<?php

use App\Models\Branch;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->school = School::factory()->create();
    setPermissionsTeamId($this->school->id);

    $this->superRole = Role::create([
        'name' => 'super-admin',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);

    $this->rangpur = Branch::factory()->forSchool($this->school)->create(['name' => 'Rangpur', 'slug' => 'rangpur']);
    $this->khulna = Branch::factory()->forSchool($this->school)->create(['name' => 'Khulna', 'slug' => 'khulna']);

    $this->headOffice = User::factory()->schoolStaff($this->school)->create();
    $this->headOffice->assignRole($this->superRole);

    // Identical role to head office — only the branch pin differs.
    $this->rangpurAdmin = User::factory()->branchStaff($this->rangpur)->create();
    $this->rangpurAdmin->assignRole($this->superRole);

    $this->rangpurStaff = User::factory()->branchStaff($this->rangpur)->create();
    $this->khulnaStaff = User::factory()->branchStaff($this->khulna)->create();
});

// ── Assignment ───────────────────────────────────────────────────────────────

test('head office can pin a new staff member to a branch', function () {
    $this->actingAs($this->headOffice)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Khulna Hire',
            'email' => 'khulna.hire@example.test',
            'password' => 'password123',
            'branch_id' => $this->khulna->id,
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    expect(User::where('email', 'khulna.hire@example.test')->first()->branch_id)
        ->toBe($this->khulna->id);
});

test('head office can leave a new staff member at head office', function () {
    $this->actingAs($this->headOffice)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Central Hire',
            'email' => 'central.hire@example.test',
            'password' => 'password123',
            'branch_id' => null,
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    expect(User::where('email', 'central.hire@example.test')->first()->branch_id)
        ->toBeNull();
});

test('staff cannot be pinned to another school branch', function () {
    // The isolation rule that matters most here: without the school_id
    // constraint on the exists() rule, a school admin could pin their own staff
    // into a different tenant's branch.
    $otherSchool = School::factory()->create();
    $foreignBranch = Branch::factory()->forSchool($otherSchool)->create();

    $this->actingAs($this->headOffice)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Cross Tenant',
            'email' => 'cross.tenant@example.test',
            'password' => 'password123',
            'branch_id' => $foreignBranch->id,
        ])
        ->assertSessionHasErrors('branch_id');

    expect(User::where('email', 'cross.tenant@example.test')->exists())->toBeFalse();
});

test('a branch-pinned admin cannot place staff in another branch', function () {
    // The submitted branch is discarded, not merely rejected: a pinned actor has
    // no say in the matter and their staff land in their own branch.
    $this->actingAs($this->rangpurAdmin)
        ->post(route('school.users.store', $this->school), [
            'name' => 'Forced Into Rangpur',
            'email' => 'forced@example.test',
            'password' => 'password123',
            'branch_id' => $this->khulna->id,
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    expect(User::where('email', 'forced@example.test')->first()->branch_id)
        ->toBe($this->rangpur->id);
});

test('a branch-pinned admin cannot promote themselves to head office', function () {
    $this->actingAs($this->rangpurAdmin)
        ->put(route('school.users.update', [$this->school, $this->rangpurStaff->id]), [
            'name' => $this->rangpurStaff->name,
            'email' => $this->rangpurStaff->email,
            'branch_id' => null,
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    expect($this->rangpurStaff->fresh()->branch_id)->toBe($this->rangpur->id);
});

test('head office can move a staff member between branches', function () {
    $this->actingAs($this->headOffice)
        ->put(route('school.users.update', [$this->school, $this->rangpurStaff->id]), [
            'name' => $this->rangpurStaff->name,
            'email' => $this->rangpurStaff->email,
            'branch_id' => $this->khulna->id,
        ])
        ->assertRedirect(route('school.users.index', $this->school));

    expect($this->rangpurStaff->fresh()->branch_id)->toBe($this->khulna->id);
});

// ── Visibility ───────────────────────────────────────────────────────────────

test('a branch-pinned admin only sees their own branch staff', function () {
    $this->actingAs($this->rangpurAdmin)
        ->get(route('school.users.index', $this->school))
        ->assertOk()
        ->assertInertia(function (Assert $page) {
            // Themselves + rangpurStaff. Not khulnaStaff, not headOffice.
            $page->has('users.data', 2);

            $ids = collect($page->toArray()['props']['users']['data'])->pluck('id');

            expect($ids)->toContain($this->rangpurAdmin->id, $this->rangpurStaff->id)
                ->and($ids)->not->toContain($this->khulnaStaff->id)
                ->and($ids)->not->toContain($this->headOffice->id);
        });
});

test('head office sees staff from every branch', function () {
    $this->actingAs($this->headOffice)
        ->get(route('school.users.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 4));
});

test('head office can filter the staff list by branch', function () {
    $this->actingAs($this->headOffice)
        ->get(route('school.users.index', [$this->school, 'branch' => $this->khulna->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 1)
            ->where('users.data.0.id', $this->khulnaStaff->id)
        );
});

test('a branch-pinned admin cannot use the branch filter to see another branch', function () {
    // The filter is head-office only; supplying it as a pinned user must not
    // widen the result set beyond their own branch.
    $this->actingAs($this->rangpurAdmin)
        ->get(route('school.users.index', [$this->school, 'branch' => $this->khulna->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('users.data', 2));
});

test('a branch-pinned admin cannot reach another branch staff member', function (string $method, string $routeName) {
    $this->actingAs($this->rangpurAdmin)
        ->{$method}(route($routeName, [$this->school, $this->khulnaStaff->id]))
        ->assertNotFound();
})->with([
    ['get', 'school.users.show'],
    ['get', 'school.users.edit'],
    ['delete', 'school.users.destroy'],
]);

test('a branch-pinned admin cannot reach a head office staff member', function () {
    // Head-office accounts sit "above" a branch, so they must not be editable
    // from inside one either.
    $this->actingAs($this->rangpurAdmin)
        ->get(route('school.users.edit', [$this->school, $this->headOffice->id]))
        ->assertNotFound();
});

test('a branch-pinned admin receives no assignable branches', function () {
    $this->actingAs($this->rangpurAdmin)
        ->get(route('school.users.create', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('branches', 0));
});

test('head office receives only their own school active branches', function () {
    Branch::factory()->forSchool($this->school)->inactive()->create();
    $otherSchool = School::factory()->create();
    Branch::factory()->forSchool($otherSchool)->create();

    $this->actingAs($this->headOffice)
        ->get(route('school.users.create', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('branches', 2));
});
