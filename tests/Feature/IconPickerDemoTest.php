<?php

use App\Http\Controllers\IconPickerDemoController;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('icon-picker-demo.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view the icon picker demo', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('icon-picker-demo.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('icon-picker-demo')
            ->where('icon', IconPickerDemoController::DEFAULT_ICON));
});

test('authenticated users can save an icon to the session', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'graduation-cap',
        ])
        ->assertRedirect(route('icon-picker-demo.index'));

    $this->actingAs($user)
        ->get(route('icon-picker-demo.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('icon-picker-demo')
            ->where('icon', 'graduation-cap'));
});

test('icon must be a valid kebab-case key', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'Not A Valid Icon!',
        ])
        ->assertSessionHasErrors('icon');
});

test('icon is required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('icon-picker-demo.store'), [])
        ->assertSessionHasErrors('icon');
});

test('icon must exist in the lucide catalog', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('icon-picker-demo.store'), [
            'icon' => 'not-a-real-icon-zzz',
        ])
        ->assertSessionHasErrors('icon');
});
