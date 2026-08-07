<?php

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    // A privileged but non-super-admin actor (the `admin` role has full user CRUD).
    $this->admin = User::factory()->platform()->create();
    $this->admin->assignRole(RoleEnum::ADMIN->value);

    $this->superAdmin = User::factory()->platform()->create();
    $this->superAdmin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

function makeSuperAdmin(): User
{
    $user = User::factory()->platform()->create();
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    return $user;
}

// ── Assigning the super-admin role ──────────────────────────────────────────

test('a non super-admin cannot assign the super-admin role when creating a user', function () {
    $this->actingAs($this->admin)
        ->post(route('platform.users.store'), [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.com',
            'password' => 'password123',
            'roles' => [RoleEnum::SUPER_ADMIN->value],
        ])
        ->assertSessionHasErrors('roles');

    expect(User::role(RoleEnum::SUPER_ADMIN->value)->count())->toBe(1);
});

test('a super-admin cannot assign a second platform super-admin role', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('platform.users.store'), [
            'name' => 'New Super',
            'email' => 'newsuper@example.com',
            'password' => 'password123',
            'roles' => [RoleEnum::SUPER_ADMIN->value],
        ])
        ->assertSessionHasErrors('roles');

    expect(User::where('email', 'newsuper@example.com')->exists())->toBeFalse();
});

// ── Acting on super-admin accounts ──────────────────────────────────────────

test('a non super-admin cannot open the edit page of a super-admin', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.users.edit', $this->superAdmin))
        ->assertForbidden();
});

test('a non super-admin cannot update a super-admin', function () {
    $this->actingAs($this->admin)
        ->put(route('platform.users.update', $this->superAdmin), [
            'name' => 'Hijacked',
            'email' => $this->superAdmin->email,
        ])
        ->assertForbidden();

    expect($this->superAdmin->fresh()->name)->not->toBe('Hijacked');
});

test('a non super-admin cannot delete a super-admin', function () {
    $this->actingAs($this->admin)
        ->delete(route('platform.users.destroy', $this->superAdmin))
        ->assertForbidden();

    expect(User::find($this->superAdmin->id))->not->toBeNull();
});

test('a super-admin can delete another super-admin', function () {
    $other = makeSuperAdmin();

    $this->actingAs($this->superAdmin)
        ->delete(route('platform.users.destroy', $other))
        ->assertRedirect();

    expect(User::find($other->id))->toBeNull();
});

// ── Last super-admin invariant ──────────────────────────────────────────────

test('the last super-admin cannot remove their own super-admin role', function () {
    // Only $this->superAdmin holds the role.
    $this->actingAs($this->superAdmin)
        ->put(route('platform.users.update', $this->superAdmin), [
            'name' => $this->superAdmin->name,
            'email' => $this->superAdmin->email,
            'roles' => [RoleEnum::ADMIN->value],
        ])
        ->assertSessionHasErrors('roles');

    expect($this->superAdmin->fresh()->isSuperAdmin())->toBeTrue();
});

test('a super-admin role can be removed once another super-admin exists', function () {
    makeSuperAdmin(); // now there are two

    $this->actingAs($this->superAdmin)
        ->put(route('platform.users.update', $this->superAdmin), [
            'name' => $this->superAdmin->name,
            'email' => $this->superAdmin->email,
            'roles' => [RoleEnum::ADMIN->value],
        ])
        ->assertRedirect(route('platform.users.index'));

    expect($this->superAdmin->fresh()->isSuperAdmin())->toBeFalse();
});

test('the last super-admin cannot be deleted', function () {
    $this->actingAs($this->superAdmin)
        ->delete(route('platform.users.destroy', $this->superAdmin))
        ->assertRedirect();

    expect(User::find($this->superAdmin->id))->not->toBeNull();
});
