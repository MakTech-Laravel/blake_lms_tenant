<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\School\CourseController;
use App\Http\Controllers\School\DashboardController;
use App\Http\Controllers\School\RoleController;
use App\Http\Controllers\School\UserController;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Support\Facades\Route;

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
    });
