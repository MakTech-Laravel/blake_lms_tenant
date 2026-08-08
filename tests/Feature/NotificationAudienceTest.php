<?php

use App\Enums\RoleEnum;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use App\Support\Notifications\AudienceResolver;
use App\Support\Notifications\AudienceSelection;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * The recipients an audience selection resolves to.
 *
 * @return array<int, int>
 */
function resolvedIds(AudienceSelection $selection): array
{
    return app(AudienceResolver::class)
        ->query($selection)
        ->orderBy('users.id')
        ->pluck('users.id')
        ->all();
}

/**
 * A school-scoped role, created the way the tenant middleware would.
 */
function schoolRole(School $school, string $name): Role
{
    app(PermissionRegistrar::class)->setPermissionsTeamId($school->id);

    $role = Role::query()->firstOrCreate([
        'name' => $name,
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);

    app(PermissionRegistrar::class)->setPermissionsTeamId(null);

    return $role;
}

test('all users reaches every active account across every portal', function () {
    $school = School::factory()->create();

    $platform = User::factory()->platform()->create();
    $staff = User::factory()->schoolStaff($school)->create();
    $teacher = User::factory()->teacher($school)->create();

    expect(resolvedIds(AudienceSelection::allUsers()))
        ->toBe([$platform->id, $staff->id, $teacher->id]);
});

test('a disabled account is never a recipient', function () {
    $active = User::factory()->create();
    User::factory()->disabled()->create();

    expect(resolvedIds(AudienceSelection::allUsers()))->toBe([$active->id]);
});

test('each account type audience reaches only that type', function () {
    $school = School::factory()->create();

    $platform = User::factory()->platform()->create();
    $staff = User::factory()->schoolStaff($school)->create();
    $teacher = User::factory()->teacher($school)->create();

    expect(resolvedIds(AudienceSelection::platformUsers()))->toBe([$platform->id])
        ->and(resolvedIds(AudienceSelection::schoolStaff()))->toBe([$staff->id])
        ->and(resolvedIds(AudienceSelection::teachers()))->toBe([$teacher->id]);
});

test('all organizations reaches everyone who belongs to one, and no platform staff', function () {
    $school = School::factory()->create();

    User::factory()->platform()->create();
    $staff = User::factory()->schoolStaff($school)->create();
    $teacher = User::factory()->teacher($school)->create();

    expect(resolvedIds(AudienceSelection::allOrganizations()))->toBe([$staff->id, $teacher->id]);
});

test('selected organizations reaches those organizations only', function () {
    $targeted = School::factory()->create();
    $other = School::factory()->create();

    $inside = User::factory()->schoolStaff($targeted)->create();
    User::factory()->schoolStaff($other)->create();

    expect(resolvedIds(AudienceSelection::organizations([$targeted->id])))->toBe([$inside->id]);
});

test('a plan audience reaches only organizations subscribed to that plan', function () {
    $growth = Plan::factory()->create(['name' => 'Growth']);
    $starter = Plan::factory()->create(['name' => 'Starter']);

    $onGrowth = School::factory()->create();
    $onStarter = School::factory()->create();
    $unsubscribed = School::factory()->create();

    Subscription::factory()->forSchool($onGrowth)->onPlan($growth)->create();
    Subscription::factory()->forSchool($onStarter)->onPlan($starter)->create();

    $reached = User::factory()->schoolStaff($onGrowth)->create();
    User::factory()->schoolStaff($onStarter)->create();
    User::factory()->schoolStaff($unsubscribed)->create();

    expect(resolvedIds(AudienceSelection::plans([$growth->id])))->toBe([$reached->id]);
});

test('role targeting reaches holders of that exact role and never a teacher', function () {
    $this->seed(PermissionSeeder::class);

    $school = School::factory()->create();
    $role = schoolRole($school, RoleEnum::MANAGER->value);

    $holder = User::factory()->schoolStaff($school)->create();
    $holder->assignRole($role);

    // Same organization, no role: teachers hold none at all.
    User::factory()->teacher($school)->create();
    User::factory()->schoolStaff($school)->create();

    expect(resolvedIds(AudienceSelection::roles([$role->id])))->toBe([$holder->id]);
});

test('role targeting ignores the request team, so one school never reaches another', function () {
    $this->seed(PermissionSeeder::class);

    $first = School::factory()->create();
    $second = School::factory()->create();

    // The same role name exists once per organization, which is why targeting
    // is by id.
    $firstRole = schoolRole($first, RoleEnum::MANAGER->value);
    $secondRole = schoolRole($second, RoleEnum::MANAGER->value);

    $firstHolder = User::factory()->schoolStaff($first)->create();
    $firstHolder->assignRole($firstRole);

    $secondHolder = User::factory()->schoolStaff($second)->create();
    $secondHolder->assignRole($secondRole);

    // Resolution must not depend on whichever team the current request set.
    app(PermissionRegistrar::class)->setPermissionsTeamId($second->id);

    expect(resolvedIds(AudienceSelection::roles([$firstRole->id])))->toBe([$firstHolder->id]);

    app(PermissionRegistrar::class)->setPermissionsTeamId(null);
});

test('individual targeting reaches exactly the people named', function () {
    $chosen = User::factory()->create();
    User::factory()->count(3)->create();

    expect(resolvedIds(AudienceSelection::individuals([$chosen->id])))->toBe([$chosen->id]);
});

test('a mode that expects ids but was given none reaches nobody rather than everyone', function () {
    User::factory()->count(5)->create();

    expect(resolvedIds(AudienceSelection::organizations([])))->toBe([])
        ->and(resolvedIds(AudienceSelection::roles([])))->toBe([])
        ->and(resolvedIds(AudienceSelection::individuals([])))->toBe([]);
});

test('a school-scoped selection is clamped to that organization whatever the mode', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $inside = User::factory()->schoolStaff($school)->create();
    $outside = User::factory()->schoolStaff($other)->create();
    User::factory()->platform()->create();

    expect(resolvedIds(AudienceSelection::allUsers($school->id)))->toBe([$inside->id])
        // Naming somebody outside the organization does not get past the clamp.
        ->and(resolvedIds(AudienceSelection::individuals([$inside->id, $outside->id], $school->id)))
        ->toBe([$inside->id]);
});

test('the stored audience label names small targets and counts large ones', function () {
    $resolver = app(AudienceResolver::class);

    $first = School::factory()->create(['name' => 'Aqua North']);
    $second = School::factory()->create(['name' => 'Aqua South']);
    $third = School::factory()->create(['name' => 'Aqua West']);

    expect($resolver->describe(AudienceSelection::allUsers()))->toBe('All Users')
        ->and($resolver->describe(AudienceSelection::organizations([$first->id])))->toBe('Aqua North')
        ->and($resolver->describe(AudienceSelection::organizations([$first->id, $second->id])))
        ->toBe('Aqua North and Aqua South')
        ->and($resolver->describe(AudienceSelection::organizations([$first->id, $second->id, $third->id])))
        ->toBe('3 organizations');
});

test('the estimate matches the number of people the selection resolves to', function () {
    User::factory()->teacher()->count(4)->create();
    User::factory()->platform()->count(2)->create();

    $resolver = app(AudienceResolver::class);

    expect($resolver->count(AudienceSelection::teachers()))->toBe(4)
        ->and($resolver->count(AudienceSelection::allUsers()))->toBe(6);
});
