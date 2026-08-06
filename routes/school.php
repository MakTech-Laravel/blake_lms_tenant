<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\School\BranchController;
use App\Http\Controllers\School\CertificateController;
use App\Http\Controllers\School\CourseController;
use App\Http\Controllers\School\DashboardController;
use App\Http\Controllers\School\RoleController;
use App\Http\Controllers\School\UserController;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| School dashboard routes  (platform.com/school/{school}/*)
|--------------------------------------------------------------------------
|
| Path-based tenancy: the {school} slug is resolved by the `tenant` middleware,
| which sets Spatie's active team to the school so every role/permission check
| is scoped to it. Restricted to `school` accounts belonging to that school.
|
*/

Route::middleware(['auth', 'verified', 'tenant', 'type:school'])
    ->prefix('school/{school}')
    ->name('school.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // ── Courses ───────────────────────────────────────────────────────────
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index')
            ->middleware('permission:'.PermissionEnum::SCHOOL_COURSES_INDEX->value);

        // ── Branches (head office only) ───────────────────────────────────────
        // `head_office` is an independent gate: holding school.branches.* via a
        // role is not enough, the account must also be school-wide.
        //
        // scopeBindings() resolves `{branch}` through the school's own relation.
        // Branch slugs are unique per school, so an unscoped global lookup could
        // otherwise bind another school's identically-slugged branch.
        Route::controller(BranchController::class)
            ->middleware('head_office')
            ->scopeBindings()
            ->group(function () {
                Route::get('branches', 'index')->name('branches.index')
                    ->middleware('permission:'.PermissionEnum::SCHOOL_BRANCHES_INDEX->value);
                Route::get('branches/create', 'create')->name('branches.create')
                    ->middleware('permission:'.PermissionEnum::SCHOOL_BRANCHES_CREATE->value);
                Route::post('branches', 'store')->name('branches.store')
                    ->middleware(['permission:'.PermissionEnum::SCHOOL_BRANCHES_CREATE->value, HandlePrecognitiveRequests::class]);
                Route::get('branches/{branch}/edit', 'edit')->name('branches.edit')
                    ->middleware('permission:'.PermissionEnum::SCHOOL_BRANCHES_EDIT->value);
                Route::put('branches/{branch}', 'update')->name('branches.update')
                    ->middleware(['permission:'.PermissionEnum::SCHOOL_BRANCHES_EDIT->value, HandlePrecognitiveRequests::class]);
                Route::delete('branches/{branch}', 'destroy')->name('branches.destroy')
                    ->middleware('permission:'.PermissionEnum::SCHOOL_BRANCHES_DELETE->value);
            });

        // ── School staff ──────────────────────────────────────────────────────
        Route::controller(UserController::class)->group(function () {
            Route::get('users', 'index')->name('users.index')
                ->middleware('permission:'.PermissionEnum::SCHOOL_STAFF_INDEX->value);
            Route::get('users/create', 'create')->name('users.create')
                ->middleware('permission:'.PermissionEnum::SCHOOL_STAFF_CREATE->value);
            Route::post('users', 'store')->name('users.store')
                ->middleware(['permission:'.PermissionEnum::SCHOOL_STAFF_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('users/{user}', 'show')->name('users.show')
                ->middleware('permission:'.PermissionEnum::SCHOOL_STAFF_VIEW->value);
            Route::get('users/{user}/edit', 'edit')->name('users.edit')
                ->middleware('permission:'.PermissionEnum::SCHOOL_STAFF_EDIT->value);
            Route::put('users/{user}', 'update')->name('users.update')
                ->middleware(['permission:'.PermissionEnum::SCHOOL_STAFF_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::delete('users/{user}', 'destroy')->name('users.destroy')
                ->middleware('permission:'.PermissionEnum::SCHOOL_STAFF_DELETE->value);
        });

        // ── School roles ──────────────────────────────────────────────────────
        Route::controller(RoleController::class)->group(function () {
            Route::get('roles', 'index')->name('roles.index')
                ->middleware('permission:'.PermissionEnum::SCHOOL_ROLES_INDEX->value);
            Route::get('roles/create', 'create')->name('roles.create')
                ->middleware('permission:'.PermissionEnum::SCHOOL_ROLES_CREATE->value);
            Route::post('roles', 'store')->name('roles.store')
                ->middleware(['permission:'.PermissionEnum::SCHOOL_ROLES_CREATE->value, HandlePrecognitiveRequests::class]);
            Route::get('roles/{role}/edit', 'edit')->name('roles.edit')
                ->middleware('permission:'.PermissionEnum::SCHOOL_ROLES_EDIT->value);
            Route::put('roles/{role}', 'update')->name('roles.update')
                ->middleware(['permission:'.PermissionEnum::SCHOOL_ROLES_EDIT->value, HandlePrecognitiveRequests::class]);
            Route::delete('roles/{role}', 'destroy')->name('roles.destroy')
                ->middleware('permission:'.PermissionEnum::SCHOOL_ROLES_DELETE->value);
        });

        // ── AquaCert UI modules (fixture-backed dedicated pages) ──────────────
        Route::get('people', [UserController::class, 'people'])->name('people.ui');
        Route::get('access', fn () => Inertia::render('school/access/index'))
            ->name('access.ui');
        Route::get('locations', [BranchController::class, 'locations'])
            ->name('locations.ui');
        Route::get('courses-ui', fn () => Inertia::render('school/courses-ui/index'))
            ->name('courses_ui.ui');
        Route::get('library', fn () => Inertia::render('school/library/index'))
            ->name('library.ui');
        Route::get('pathways', fn () => Inertia::render('school/pathways/index'))
            ->name('pathways.ui');
        Route::get('assignments', fn () => Inertia::render('school/assignments/index'))
            ->name('assignments.ui');
        Route::get('assessments', fn () => Inertia::render('school/assessments/index'))
            ->name('assessments.ui');
        Route::controller(CertificateController::class)->group(function () {
            Route::get('certificates', 'index')->name('certificates.ui');
            Route::post('certificates', 'store')->name('certificates.store');
            Route::get('certificates/{certificate}/download', 'download')->name('certificates.download');
        });
        Route::get('billing', fn () => Inertia::render('school/billing/index'))
            ->name('billing.ui');
        Route::get('reports', fn () => Inertia::render('school/reports/index'))
            ->name('reports.ui');
        Route::get('notifications', fn () => Inertia::render('school/notifications/index'))
            ->name('notifications.ui');
        Route::get('settings', fn () => Inertia::render('school/settings/index'))
            ->name('settings.ui');

        Route::get('courses/wizard', fn () => Inertia::render('school/course-wizard'))
            ->name('courses.wizard');
    });
