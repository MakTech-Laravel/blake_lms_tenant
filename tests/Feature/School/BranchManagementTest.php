<?php

use App\Enums\PermissionEnum;
use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

/**
 * @return list<string>
 */
function branchPermissionNames(): array
{
    return array_map(fn (PermissionEnum $case): string => $case->value, [
        PermissionEnum::SCHOOL_BRANCHES_INDEX,
        PermissionEnum::SCHOOL_BRANCHES_VIEW,
        PermissionEnum::SCHOOL_BRANCHES_CREATE,
        PermissionEnum::SCHOOL_BRANCHES_EDIT,
        PermissionEnum::SCHOOL_BRANCHES_DELETE,
    ]);
}

beforeEach(function () {
    $this->seed(PermissionSeeder::class);

    $this->school = School::factory()->create();
    setPermissionsTeamId($this->school->id);

    $this->superRole = Role::create([
        'name' => 'super-admin',
        'guard_name' => 'web',
        'school_id' => $this->school->id,
    ]);
    $this->superRole->givePermissionTo(branchPermissionNames());

    $this->rangpur = Branch::factory()->forSchool($this->school)->create(['name' => 'Rangpur', 'slug' => 'rangpur']);

    // Head office: school-wide, branch_id NULL.
    $this->admin = User::factory()->schoolStaff($this->school)->create();
    $this->admin->assignRole($this->superRole);

    // Same role, but pinned to a branch. Every assertion pairing these two
    // exists to prove the permission gate and the head-office gate are
    // independent of each other.
    $this->branchAdmin = User::factory()->branchStaff($this->rangpur)->create();
    $this->branchAdmin->assignRole($this->superRole);
});

test('a head-office admin can view the branches list', function () {
    $this->actingAs($this->admin)
        ->get(route('school.branches.index', $this->school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/branches/index')
            ->has('branches.data', 1)
        );
});

test('branches are isolated per school', function () {
    $other = School::factory()->create();
    Branch::factory()->forSchool($other)->create(['name' => 'Foreign', 'slug' => 'foreign']);

    $this->actingAs($this->admin)
        ->get(route('school.branches.index', $this->school))
        ->assertInertia(fn (Assert $page) => $page->has('branches.data', 1));
});

test('a branch is created scoped to the school with a slug derived from its name', function () {
    $this->actingAs($this->admin)
        ->post(route('school.branches.store', $this->school), [
            'name' => 'Khulna Campus',
            'is_active' => true,
        ])
        ->assertRedirect(route('school.branches.index', $this->school));

    $branch = Branch::where('slug', 'khulna-campus')->first();

    expect($branch)->not->toBeNull()
        ->and($branch->school_id)->toBe($this->school->id)
        ->and($branch->name)->toBe('Khulna Campus');
});

test('a branch slug must be unique within the school but may repeat across schools', function () {
    $this->actingAs($this->admin)
        ->post(route('school.branches.store', $this->school), ['name' => 'Rangpur'])
        ->assertSessionHasErrors('slug');

    $other = School::factory()->create();
    $otherAdmin = User::factory()->schoolStaff($other)->create();
    setPermissionsTeamId($other->id);
    $otherRole = Role::create(['name' => 'super-admin', 'guard_name' => 'web', 'school_id' => $other->id]);
    $otherRole->givePermissionTo(branchPermissionNames());
    $otherAdmin->assignRole($otherRole);

    $this->actingAs($otherAdmin)
        ->post(route('school.branches.store', $other), ['name' => 'Rangpur'])
        ->assertSessionHasNoErrors();

    expect(Branch::where('slug', 'rangpur')->count())->toBe(2);
});

test('an identically slugged branch of another school is never bound', function () {
    // Branch slugs are only unique per school, so an unscoped global lookup
    // could resolve the wrong school's branch. The foreign branch is created
    // FIRST on purpose: it therefore has the lower id, so an unscoped
    // `where('slug', ...)->first()` would return it and this test would fail.
    // Creating it second would make the assertion pass either way.
    $other = School::factory()->create();
    $foreign = Branch::factory()->forSchool($other)->create(['name' => 'Shared', 'slug' => 'shared']);
    $mine = Branch::factory()->forSchool($this->school)->create(['name' => 'Shared', 'slug' => 'shared']);

    // Proof the scenario is adversarial: the naive resolution Laravel would use
    // without scopeBindings() returns the other school's branch.
    expect(Branch::where('slug', 'shared')->first()->id)->toBe($foreign->id)
        ->and($foreign->id)->toBeLessThan($mine->id);

    $this->actingAs($this->admin)
        ->get(route('school.branches.edit', [$this->school, 'shared']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('branch.id', $mine->id));
});

test('a branch belonging to another school cannot be edited', function () {
    $other = School::factory()->create();
    $foreign = Branch::factory()->forSchool($other)->create(['slug' => 'foreign']);

    $this->actingAs($this->admin)
        ->get(route('school.branches.edit', [$this->school, $foreign->slug]))
        ->assertNotFound();
});

test('a branch can be renamed and deactivated', function () {
    $this->actingAs($this->admin)
        ->put(route('school.branches.update', [$this->school, $this->rangpur->slug]), [
            'name' => 'Rangpur Main',
            'slug' => 'rangpur',
            'is_active' => false,
        ])
        ->assertRedirect(route('school.branches.index', $this->school));

    expect($this->rangpur->fresh())
        ->name->toBe('Rangpur Main')
        ->is_active->toBeFalse();
});

test('a branch with staff pinned to it cannot be deleted', function () {
    $this->actingAs($this->admin)
        ->delete(route('school.branches.destroy', [$this->school, $this->rangpur->slug]));

    expect(Branch::whereKey($this->rangpur->id)->exists())->toBeTrue();
});

test('a branch with no staff can be deleted', function () {
    $empty = Branch::factory()->forSchool($this->school)->create(['slug' => 'empty']);

    $this->actingAs($this->admin)
        ->delete(route('school.branches.destroy', [$this->school, $empty->slug]));

    expect(Branch::whereKey($empty->id)->exists())->toBeFalse();
});

test('deleting a branch leaves its courses school-wide rather than orphaned', function () {
    $empty = Branch::factory()->forSchool($this->school)->create(['slug' => 'closing']);
    $course = Course::factory()->forBranch($empty)->create();

    $this->actingAs($this->admin)
        ->delete(route('school.branches.destroy', [$this->school, $empty->slug]));

    expect($course->fresh()->branch_id)->toBeNull();
})->skip(
    fn () => DB::connection()->getDriverName() === 'sqlite',
    'SQLite does not enforce the nullOnDelete foreign key; verified against MySQL.',
);

// ── The two gates are independent ────────────────────────────────────────────

test('a branch-pinned admin holding the branch permissions is still refused', function (string $method, string $routeName, bool $needsBranch) {
    $params = $needsBranch ? [$this->school, $this->rangpur->slug] : [$this->school];

    expect($this->branchAdmin->hasPermissionTo(PermissionEnum::SCHOOL_BRANCHES_INDEX->value))->toBeTrue();

    $this->actingAs($this->branchAdmin)
        ->{$method}(route($routeName, $params))
        ->assertForbidden();
})->with([
    ['get', 'school.branches.index', false],
    ['get', 'school.branches.create', false],
    ['post', 'school.branches.store', false],
    ['get', 'school.branches.edit', true],
    ['put', 'school.branches.update', true],
    ['delete', 'school.branches.destroy', true],
]);

test('a head-office admin without the branch permissions is refused', function () {
    $plainRole = Role::create(['name' => 'registrar', 'guard_name' => 'web', 'school_id' => $this->school->id]);
    $user = User::factory()->schoolStaff($this->school)->create();
    $user->assignRole($plainRole);

    $this->actingAs($user)
        ->get(route('school.branches.index', $this->school))
        ->assertForbidden();
});

test('a branch-pinned admin cannot create a branch even with a valid payload', function () {
    $this->actingAs($this->branchAdmin)
        ->post(route('school.branches.store', $this->school), ['name' => 'Barishal'])
        ->assertForbidden();

    expect(Branch::where('slug', 'barishal')->exists())->toBeFalse();
});
