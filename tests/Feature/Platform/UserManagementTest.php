<?php

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->platform()->create();
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('guests cannot access user management', function () {
    $this->get(route('platform.users.index'))->assertRedirect(route('login'));
});

test('platform users without permission are forbidden', function () {
    $plain = User::factory()->platform()->create();

    $this->actingAs($plain)->get(route('platform.users.index'))->assertForbidden();
});

test('super admin can view the users list', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.users.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/users/index')
                ->has('users.data')
                ->has('roles')
        );
});

test('a user can be created with multiple roles', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.users.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'roles' => [RoleEnum::EDITOR->value, RoleEnum::AUTHOR->value],
        ])
        ->assertRedirect(route('platform.users.index'));

    $user = User::where('email', 'jane@example.com')->sole();

    expect($user->name)->toBe('Jane Doe')
        ->and($user->isPlatformStaff())->toBeTrue()
        ->and($user->hasRole(RoleEnum::EDITOR->value))->toBeTrue()
        ->and($user->hasRole(RoleEnum::AUTHOR->value))->toBeTrue()
        ->and(Hash::check('password123', $user->password))->toBeTrue();
});

test('creating a user validates required fields', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.users.store'), [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
        ])
        ->assertSessionHasErrors(['name', 'email', 'password']);

    expect(User::where('email', 'not-an-email')->exists())->toBeFalse();
});

test('the email must be unique', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs($this->admin)
        ->post(route('platform.users.store'), [
            'name' => 'Dupe',
            'email' => 'taken@example.com',
            'password' => 'password123',
        ])
        ->assertSessionHasErrors('email');
});

test('a user can be updated and roles re-synced', function () {
    $user = User::factory()->platform()->create();
    $user->assignRole(RoleEnum::USER->value);

    $this->actingAs($this->admin)
        ->put(route('platform.users.update', $user), [
            'name' => 'Renamed',
            'email' => $user->email,
            'password' => '',
            'roles' => [RoleEnum::ADMIN->value],
        ])
        ->assertRedirect(route('platform.users.index'));

    $user->refresh();

    expect($user->name)->toBe('Renamed')
        ->and($user->hasRole(RoleEnum::ADMIN->value))->toBeTrue()
        ->and($user->hasRole(RoleEnum::USER->value))->toBeFalse();
});

test('updating without a password keeps the current one', function () {
    $user = User::factory()->platform()->create(['password' => 'secret-pass']);

    $this->actingAs($this->admin)
        ->put(route('platform.users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'password' => '',
        ])
        ->assertRedirect();

    expect(Hash::check('secret-pass', $user->fresh()->password))->toBeTrue();
});

test('a user can be deleted', function () {
    $user = User::factory()->platform()->create();

    $this->actingAs($this->admin)
        ->delete(route('platform.users.destroy', $user))
        ->assertRedirect();

    expect(User::find($user->id))->toBeNull();
});
