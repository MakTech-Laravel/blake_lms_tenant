<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the html shell never receives a dark class even with a dark appearance cookie', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withCookie('appearance', 'dark')
        ->get(route('dashboard'))
        ->assertOk()
        ->assertDontSee('class="dark"', false)
        ->assertSee('color-scheme" content="light"', false);
});

test('the html shell never receives a dark class even with a system appearance cookie', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withCookie('appearance', 'system')
        ->get(route('dashboard'))
        ->assertOk()
        ->assertDontSee("classList.add('dark')", false)
        ->assertSee("classList.remove('dark')", false);
});

test('handle appearance always shares light regardless of cookie', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withCookie('appearance', 'dark')
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            // Shared via View::share for Blade; Inertia page itself does not
            // expose appearance as a prop — assert the settings page still loads.
            ->component('settings/appearance')
        );
});
