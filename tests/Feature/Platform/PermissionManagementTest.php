<?php

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->platform()->create();
    $this->admin->assignRole(RoleEnum::SUPER_ADMIN->value);
});

test('the permissions list is grouped and read-only', function () {
    $this->actingAs($this->admin)
        ->get(route('platform.permissions.index'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('platform/permissions/index')
                ->has('permissions')
        );
});

test('permissions can be exported as csv', function () {
    Excel::fake();

    $this->actingAs($this->admin)
        ->get(route('platform.permissions.export', ['format' => 'csv']))
        ->assertOk();

    Excel::matchByRegex();
    Excel::assertDownloaded('/permissions-.*\.csv/');
});

test('permissions can be exported as excel', function () {
    Excel::fake();

    $this->actingAs($this->admin)
        ->get(route('platform.permissions.export', ['format' => 'xlsx']))
        ->assertOk();

    Excel::matchByRegex();
    Excel::assertDownloaded('/permissions-.*\.xlsx/');
});

test('exporting requires the export permission', function () {
    $plain = User::factory()->platform()->create();

    $this->actingAs($plain)
        ->get(route('platform.permissions.export', ['format' => 'csv']))
        ->assertForbidden();
});
