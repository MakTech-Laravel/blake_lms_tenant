<?php

use App\Enums\RoleEnum;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->platform()->create([
        'status' => UserStatus::Active,
    ]);
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('people index paginates fifteen users per page', function () {
    $school = School::factory()->create();
    User::factory()->count(16)->teacher($school)->create();

    $this->actingAs($this->admin)
        ->get(route('platform.people.index', ['type' => 'teacher']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('people.per_page', 15)
            ->has('people.data', 15)
            ->where('people.total', 16));
});

test('people directory search matches name email role organization type and status', function (
    string $search,
    string $expectedName,
) {
    $school = School::factory()->create(['name' => 'Harbor Academy']);

    User::factory()->teacher($school)->create([
        'name' => 'Alice Teacher',
        'email' => 'alice.teacher@example.com',
        'status' => UserStatus::Active,
    ]);

    $editor = User::factory()->platform()->create([
        'name' => 'Bob Editor',
        'email' => 'bob.editor@example.com',
        'status' => UserStatus::Pending,
    ]);
    $editor->assignRole(RoleEnum::EDITOR->value);

    User::factory()->schoolStaff($school)->create([
        'name' => 'Carol Org',
        'email' => 'carol.org@example.com',
        'status' => UserStatus::Disabled,
    ]);

    $this->actingAs($this->admin)
        ->get(route('platform.people.index', ['search' => $search]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.search', $search)
            ->has('people.data')
            ->where(
                'people.data',
                fn ($data): bool => collect($data)->contains(
                    fn ($row): bool => ($row['name'] ?? null) === $expectedName,
                ),
            ));
})->with([
    'name' => ['Alice', 'Alice Teacher'],
    'email' => ['carol.org@', 'Carol Org'],
    'role' => ['editor', 'Bob Editor'],
    'instructor role' => ['Instructor', 'Alice Teacher'],
    'organization' => ['Harbor', 'Carol Org'],
    'platform organization' => ['AquaCert', 'Bob Editor'],
    'type' => ['teacher', 'Alice Teacher'],
    'status' => ['disabled', 'Carol Org'],
]);

test('people index defaults to all user types', function () {
    $school = School::factory()->create();
    User::factory()->teacher($school)->create(['name' => 'Teacher A']);
    User::factory()->schoolStaff($school)->create(['name' => 'Org User']);

    $this->actingAs($this->admin)
        ->get(route('platform.people.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/people/index')
            ->where('filters.type', 'all')
            ->has('people.data', 3)
            ->where('stats.total', 3)
            ->has('people.data.0.user_type_label'));
});

test('people index filters teachers via type query', function () {
    $school = School::factory()->create();
    $teacher = User::factory()->teacher($school)->create(['name' => 'Teacher Only']);
    User::factory()->schoolStaff($school)->create(['name' => 'Org Hidden']);
    User::factory()->platform()->create(['name' => 'Platform Hidden']);

    $this->actingAs($this->admin)
        ->get(route('platform.people.index', ['type' => 'teacher']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/people/index')
            ->where('filters.type', 'teacher')
            ->has('people.data', 1)
            ->where('people.data.0.id', $teacher->id)
            ->where('stats.total', 1));
});

test('people index filters organization users via type query', function () {
    $school = School::factory()->create();
    $orgUser = User::factory()->schoolStaff($school)->create(['name' => 'Org Only']);
    User::factory()->teacher($school)->create(['name' => 'Teacher Hidden']);

    $this->actingAs($this->admin)
        ->get(route('platform.people.index', ['type' => 'school']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.type', 'school')
            ->has('people.data', 1)
            ->where('people.data.0.id', $orgUser->id));
});

test('people index filters platform users via type query', function () {
    $school = School::factory()->create();
    User::factory()->teacher($school)->create(['name' => 'Teacher Hidden']);

    $this->actingAs($this->admin)
        ->get(route('platform.people.index', ['type' => 'platform']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.type', 'platform')
            ->has('people.data', 1)
            ->where('people.data.0.id', $this->admin->id)
            ->where('stats.total', 1));
});

test('can create a teacher from people directory', function () {
    $school = School::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('platform.people.store'), [
            'name' => 'New Teacher',
            'email' => 'new.teacher@example.com',
            'password' => 'password123',
            'school_id' => $school->id,
        ])
        ->assertRedirect(route('platform.people.index', ['type' => 'teacher']));

    $teacher = User::query()->where('email', 'new.teacher@example.com')->first();

    expect($teacher)->not->toBeNull()
        ->and($teacher->type)->toBe(UserType::TEACHER)
        ->and($teacher->status)->toBe(UserStatus::Pending)
        ->and($teacher->school_id)->toBe($school->id);
});

test('can create platform user from people directory', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.people.store_platform'), [
            'name' => 'New Staff',
            'email' => 'new.staff@example.com',
            'password' => 'password123',
            'roles' => [RoleEnum::EDITOR->value],
        ])
        ->assertRedirect(route('platform.people.index', ['type' => 'platform']));

    $staff = User::query()->where('email', 'new.staff@example.com')->first();

    expect($staff)->not->toBeNull()
        ->and($staff->type)->toBe(UserType::PLATFORM)
        ->and($staff->status)->toBe(UserStatus::Pending)
        ->and($staff->hasRole(RoleEnum::EDITOR->value))->toBeTrue();
});

test('can create organization user from people directory', function () {
    $school = School::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('platform.people.store_organization'), [
            'name' => 'Org Staff',
            'email' => 'org.staff@example.com',
            'password' => 'password123',
            'school_id' => $school->id,
        ])
        ->assertRedirect(route('platform.people.index', ['type' => 'school']));

    $user = User::query()->where('email', 'org.staff@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->type)->toBe(UserType::SCHOOL)
        ->and($user->school_id)->toBe($school->id);
});

test('can disable a teacher from the directory', function () {
    $school = School::factory()->create();
    $teacher = User::factory()->teacher($school)->create([
        'status' => UserStatus::Active,
    ]);

    $this->actingAs($this->admin)
        ->patch(route('platform.directory_users.status', $teacher), [
            'status' => UserStatus::Disabled->value,
        ])
        ->assertRedirect();

    expect($teacher->fresh()->status)->toBe(UserStatus::Disabled);
});

test('login stamps last_login_at', function () {
    $user = User::factory()->platform()->create([
        'email' => 'login.stamp@example.com',
        'password' => 'password',
        'last_login_at' => null,
        'status' => UserStatus::Active,
    ]);
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    $this->post('/login', [
        'email' => 'login.stamp@example.com',
        'password' => 'password',
    ])->assertRedirect();

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

test('guest cannot access people directory', function () {
    $this->get(route('platform.people.index'))->assertRedirect();
});

test('platform staff routes are removed', function () {
    expect(fn () => route('platform.platform_staff.index'))
        ->toThrow(RouteNotFoundException::class);
});
