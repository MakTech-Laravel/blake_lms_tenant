<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\IconPickerDemoController;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

/**
 * The demo routes are gated on icon-picker.index / icon-picker.store, so each
 * test acts as a super-admin (satisfied via Gate::before) unless it is
 * asserting the gate itself.
 */
beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->demoUser = User::factory()->create();
    $this->demoUser->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('guests are redirected to the login page', function () {
    $this->get(route('icon-picker-demo.index'))
        ->assertRedirect(route('login'));
});

test('users without the icon picker permission are forbidden', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('icon-picker-demo.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('icon-picker-demo.store'), ['icon' => 'graduation-cap'])
        ->assertForbidden();
});

test('users with the icon picker permission can view the demo', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(PermissionEnum::ICON_PICKER_INDEX->value);

    $this->actingAs($user)
        ->get(route('icon-picker-demo.index'))
        ->assertOk();
});

test('authenticated users can view the icon picker demo', function () {
    $this->actingAs($this->demoUser)
        ->get(route('icon-picker-demo.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('icon-picker-demo')
            ->where('icon', IconPickerDemoController::DEFAULT_ICON));
});

test('authenticated users can save an icon to the session', function () {
    $this->actingAs($this->demoUser)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'graduation-cap',
        ])
        ->assertRedirect(route('icon-picker-demo.index'));

    $this->actingAs($this->demoUser)
        ->get(route('icon-picker-demo.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('icon-picker-demo')
            ->where('icon', 'graduation-cap'));
});

test('icon must be a valid kebab-case key', function () {
    $this->actingAs($this->demoUser)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'Not A Valid Icon!',
        ])
        ->assertSessionHasErrors('icon');
});

test('icon is required', function () {
    $this->actingAs($this->demoUser)
        ->post(route('icon-picker-demo.store'), [])
        ->assertSessionHasErrors('icon');
});

test('icon must exist in the lucide catalog', function () {
    $this->actingAs($this->demoUser)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'not-a-real-icon-zzz',
        ])
        ->assertSessionHasErrors('icon');
});
