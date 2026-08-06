<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\Platform\DashboardController;
use App\Http\Controllers\Platform\PermissionController;
use App\Http\Controllers\Platform\RoleController;
use App\Http\Controllers\Platform\SchoolController;
use App\Http\Controllers\Platform\UserController;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Platform dashboard routes  (platform.com/platform/*)
|--------------------------------------------------------------------------
|
| Path-based, never subdomain-based. Restricted to `platform` accounts. The
| active permission team defaults to NULL here, so platform roles resolve as
| global roles.
|
*/

Route::middleware(['auth', 'verified', 'type:platform'])
    ->prefix('platform')
    ->name('platform.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // ── Schools (tenants) ─────────────────────────────────────────────────
        Route::get('schools', [SchoolController::class, 'index'])->name('schools.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_INDEX->value);

        // ── Access control: platform staff ────────────────────────────────────
        Route::controller(UserController::class)->group(function () {
            Route::get('users', 'index')->name('users.index')
                ->middleware('permission:'.PermissionEnum::USERS_INDEX->value);
            Route::get('users/create', 'create')->name('users.create')
                ->middleware('permission:'.PermissionEnum::USERS_CREATE->value);
            Route::post('users', 'store')->name('users.store')
                ->middleware(['permission:'.PermissionEnum::USERS_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('users/{user}', 'show')->name('users.show')
                ->middleware('permission:'.PermissionEnum::USERS_VIEW->value);
            Route::get('users/{user}/edit', 'edit')->name('users.edit')
                ->middleware('permission:'.PermissionEnum::USERS_EDIT->value);
            Route::put('users/{user}', 'update')->name('users.update')
                ->middleware(['permission:'.PermissionEnum::USERS_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::delete('users/{user}', 'destroy')->name('users.destroy')
                ->middleware('permission:'.PermissionEnum::USERS_DELETE->value);
        });

        // ── Access control: platform roles ────────────────────────────────────
        Route::controller(RoleController::class)->group(function () {
            Route::get('roles', 'index')->name('roles.index')
                ->middleware('permission:'.PermissionEnum::ROLES_INDEX->value);
            Route::get('roles/create', 'create')->name('roles.create')
                ->middleware('permission:'.PermissionEnum::ROLES_CREATE->value);
            Route::post('roles', 'store')->name('roles.store')
                ->middleware(['permission:'.PermissionEnum::ROLES_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('roles/{role}/edit', 'edit')->name('roles.edit')
                ->middleware('permission:'.PermissionEnum::ROLES_EDIT->value);
            Route::put('roles/{role}', 'update')->name('roles.update')
                ->middleware(['permission:'.PermissionEnum::ROLES_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::delete('roles/{role}', 'destroy')->name('roles.destroy')
                ->middleware('permission:'.PermissionEnum::ROLES_DELETE->value);
        });

        // ── Access control: platform permissions (read-only + export) ─────────
        Route::controller(PermissionController::class)->group(function () {
            Route::get('permissions', 'index')->name('permissions.index')
                ->middleware('permission:'.PermissionEnum::PERMISSIONS_INDEX->value);
            Route::get('permissions/export', 'export')->name('permissions.export')
                ->middleware('permission:'.PermissionEnum::PERMISSIONS_EXPORT->value);
        });

        // ── Static AquaCert UI modules (fixtures only) ────────────────────────
        Route::get('organizations', fn () => Inertia::render('platform/organizations'))
            ->name('organizations.index');

        $staticModules = [
            'locations' => ['Locations', 'All swim school locations across the platform'],
            'subscriptions' => ['Subscriptions', 'Plans, renewals, and MRR overview'],
            'people' => ['People', 'Platform staff and organization contacts'],
            'access' => ['Roles & Permissions', 'Access control across the AquaCert platform'],
            'learning' => ['Learning', 'Platform course library and content packs'],
            'pathways' => ['Learning Pathways', 'Structured learning journeys for staff'],
            'assessments' => ['Assessments', 'Quizzes and competency checks'],
            'certificates' => ['Certificates', 'Issued, pending, and expired certificates'],
            'reports' => ['Reports', 'Platform analytics and exportable reports'],
            'notifications' => ['Notifications', 'Announcements and system alerts'],
            'support' => ['Support Tools', 'Impersonation, audits, and support utilities'],
            'system-settings' => ['System Settings', 'Platform configuration and integrations'],
        ];

        foreach ($staticModules as $slug => [$title, $subtitle]) {
            Route::get($slug, fn () => Inertia::render('platform/static-resource', [
                'title' => $title,
                'subtitle' => $subtitle,
            ]))->name(str_replace('-', '_', $slug).'.index');
        }
    });
