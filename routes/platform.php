<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\Platform\CertificateController;
use App\Http\Controllers\Platform\DashboardController;
use App\Http\Controllers\Platform\NotificationController;
use App\Http\Controllers\Platform\OrganizationController;
use App\Http\Controllers\Platform\PermissionController;
use App\Http\Controllers\Platform\PlanController;
use App\Http\Controllers\Platform\RoleController;
use App\Http\Controllers\Platform\SubscriptionController;
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
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard')
            ->middleware('permission:'.PermissionEnum::DASHBOARD_VIEW->value);

        // ── Organizations (tenants) ───────────────────────────────────────────
        // The model is School; "Organization" is the customer-facing wording.
        Route::controller(OrganizationController::class)->group(function () {
            Route::get('organizations', 'index')->name('organizations.index')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_INDEX->value);
            Route::get('organizations/export', 'export')->name('organizations.export')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_EXPORT->value);
            Route::get('organizations/create', 'create')->name('organizations.create')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_CREATE->value);
            Route::post('organizations', 'store')->name('organizations.store')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_SCHOOLS_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('organizations/{organization}', 'show')->name('organizations.show')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_VIEW->value);
            Route::get('organizations/{organization}/edit', 'edit')->name('organizations.edit')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_EDIT->value);
            Route::put('organizations/{organization}', 'update')->name('organizations.update')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_SCHOOLS_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::patch('organizations/{organization}/status', 'updateStatus')->name('organizations.status')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_EDIT->value);
            Route::delete('organizations/{organization}', 'destroy')->name('organizations.destroy')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SCHOOLS_DELETE->value);
        });

        // Legacy path kept so existing links keep resolving.
        Route::get('schools', fn () => redirect()->route('platform.organizations.index'))
            ->name('schools.index')
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
            Route::get('roles/export', 'export')->name('roles.export')
                ->middleware('permission:'.PermissionEnum::ROLES_EXPORT->value);
            Route::get('roles/create', 'create')->name('roles.create')
                ->middleware('permission:'.PermissionEnum::ROLES_CREATE->value);
            Route::post('roles', 'store')->name('roles.store')
                ->middleware(['permission:'.PermissionEnum::ROLES_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('roles/{role}', 'show')->name('roles.show')
                ->middleware('permission:'.PermissionEnum::ROLES_VIEW->value);
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

        // ── AquaCert UI modules (fixture-backed dedicated pages) ──────────────
        Route::get('locations', fn () => Inertia::render('platform/locations/index'))
            ->name('locations.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_LOCATIONS_INDEX->value);
        // ── Subscriptions ─────────────────────────────────────────────────────
        // One page, two tabs: the plan catalog and the per-organization
        // agreements sold against it.
        Route::controller(SubscriptionController::class)->group(function () {
            Route::get('subscriptions', 'index')->name('subscriptions.index')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX->value);
            Route::get('subscriptions/export', 'export')->name('subscriptions.export')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EXPORT->value);
            Route::post('subscriptions/{subscription}/checkout', 'checkout')->name('subscriptions.checkout')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
            Route::patch('subscriptions/{subscription}/cancel', 'cancel')->name('subscriptions.cancel')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
            Route::patch('subscriptions/{subscription}/resume', 'resume')->name('subscriptions.resume')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
            Route::post('subscriptions/{subscription}/refund', 'refund')->name('subscriptions.refund')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
        });

        // Editing the plan catalog. Listed on the Subscriptions page above, so
        // there is no plans.index of its own.
        Route::controller(PlanController::class)->group(function () {
            Route::get('plans/create', 'create')->name('plans.create')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_CREATE->value);
            Route::post('plans', 'store')->name('plans.store')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('plans/{plan}/edit', 'edit')->name('plans.edit')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
            Route::put('plans/{plan}', 'update')->name('plans.update')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::post('plans/{plan}/duplicate', 'duplicate')->name('plans.duplicate')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_CREATE->value);
            Route::delete('plans/{plan}', 'destroy')->name('plans.destroy')
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_DELETE->value);
            // Restoring has to resolve an archived plan, hence withTrashed().
            Route::patch('plans/{plan}/restore', 'restore')->name('plans.restore')
                ->withTrashed()
                ->middleware('permission:'.PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT->value);
        });
        Route::get('people', [UserController::class, 'people'])->name('people.index')
            ->middleware('permission:'.PermissionEnum::USERS_INDEX->value);
        Route::get('people/export', [UserController::class, 'exportPeople'])->name('people.export')
            ->middleware('permission:'.PermissionEnum::USERS_EXPORT->value);
        Route::post('people', [UserController::class, 'storeTeacher'])->name('people.store')
            ->middleware(['permission:'.PermissionEnum::USERS_CREATE->value, HandlePrecognitiveRequests::class]);
        Route::post('people/platform', [UserController::class, 'storePlatformStaff'])->name('people.store_platform')
            ->middleware(['permission:'.PermissionEnum::USERS_CREATE->value, HandlePrecognitiveRequests::class]);
        Route::post('people/organization', [UserController::class, 'storeOrganizationUser'])->name('people.store_organization')
            ->middleware(['permission:'.PermissionEnum::USERS_CREATE->value, HandlePrecognitiveRequests::class]);
        Route::get('people/{user}', [UserController::class, 'showPerson'])->name('people.show')
            ->middleware('permission:'.PermissionEnum::USERS_VIEW->value);
        Route::patch('directory-users/{user}/status', [UserController::class, 'updateStatus'])
            ->name('directory_users.status')
            ->middleware('permission:'.PermissionEnum::USERS_EDIT->value);
        Route::delete('directory-users/{user}', [UserController::class, 'destroyDirectoryUser'])
            ->name('directory_users.destroy')
            ->middleware('permission:'.PermissionEnum::USERS_DELETE->value);
        Route::get('access', fn () => redirect()->route('platform.roles.index'))
            ->name('access.index')
            ->middleware('permission:'.PermissionEnum::ROLES_INDEX->value);
        Route::get('learning', fn () => Inertia::render('platform/learning/index'))
            ->name('learning.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_LEARNING_INDEX->value);
        Route::get('pathways', fn () => Inertia::render('platform/pathways/index'))
            ->name('pathways.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_PATHWAYS_INDEX->value);
        Route::get('assessments', fn () => Inertia::render('platform/assessments/index'))
            ->name('assessments.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_ASSESSMENTS_INDEX->value);
        Route::controller(CertificateController::class)->group(function () {
            Route::get('certificates', 'index')->name('certificates.index')
                ->middleware('permission:'.PermissionEnum::PLATFORM_CERTIFICATES_INDEX->value);
            Route::post('certificates', 'store')->name('certificates.store')
                ->middleware('permission:'.PermissionEnum::PLATFORM_CERTIFICATES_ISSUE->value);
            Route::get('certificates/{certificate}/download', 'download')->name('certificates.download')
                ->middleware('permission:'.PermissionEnum::PLATFORM_CERTIFICATES_DOWNLOAD->value);
        });
        Route::get('reports', fn () => Inertia::render('platform/reports/index'))
            ->name('reports.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_REPORTS_INDEX->value);
        // ── Notifications & announcements ─────────────────────────────────────
        // Authoring and delivery reporting. A recipient's own inbox lives on the
        // shared `notifications.*` routes in web.php instead.
        Route::controller(NotificationController::class)->group(function () {
            Route::get('notifications', 'index')->name('notifications.index')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_INDEX->value);
            Route::get('notifications/export', 'export')->name('notifications.export')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_EXPORT->value);
            // Both feed the announcement builder as the author types.
            Route::get('notifications/audience-options', 'audienceOptions')->name('notifications.audience_options')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_SEND->value);
            Route::get('notifications/estimate', 'estimate')->name('notifications.estimate')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_SEND->value);
            Route::post('notifications', 'store')->name('notifications.store')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_SEND->value, HandlePrecognitiveRequests::class]);
            Route::get('notifications/{notification}', 'show')->name('notifications.show')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_VIEW->value);
            Route::put('notifications/{notification}', 'update')->name('notifications.update')
                ->middleware(['permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::post('notifications/{notification}/send', 'send')->name('notifications.send')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_SEND->value);
            Route::patch('notifications/{notification}/archive', 'archive')->name('notifications.archive')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_EDIT->value);
            Route::patch('notifications/{notification}/unarchive', 'unarchive')->name('notifications.unarchive')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_EDIT->value);
            Route::delete('notifications/{notification}', 'destroy')->name('notifications.destroy')
                ->middleware('permission:'.PermissionEnum::PLATFORM_NOTIFICATIONS_DELETE->value);
        });
        Route::get('support', fn () => Inertia::render('platform/support/index'))
            ->name('support.index')
            ->middleware('permission:'.PermissionEnum::PLATFORM_SUPPORT_INDEX->value);
        Route::get('system-settings', fn () => Inertia::render('platform/system-settings/index'))
            ->name('system_settings.index')
            ->middleware('permission:'.PermissionEnum::SETTINGS_VIEW->value);
    });
