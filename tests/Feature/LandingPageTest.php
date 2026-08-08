<?php

use Inertia\Testing\AssertableInertia as Assert;

test('landing page renders the aqua cert welcome page', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('canRegister')
        );
});

test('login page renders the aqua cert split login screen', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->has('canResetPassword')
            ->has('canRegister')
        );
});
