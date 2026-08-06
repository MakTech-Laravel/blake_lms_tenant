<?php

use App\Http\Controllers\Teacher\CertificateController;
use App\Http\Controllers\Teacher\CourseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Teacher dashboard routes  (platform.com/dashboard/*)
|--------------------------------------------------------------------------
|
| Teachers/students. They hold no roles — access is derived from their course
| enrollments — so these routes are gated only by account type.
|
*/

Route::middleware(['auth', 'verified', 'type:teacher'])
    ->prefix('dashboard')
    ->name('teacher.')
    ->group(function () {
        Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
        Route::get('certificates', [CertificateController::class, 'index'])->name('certificates.index');

        Route::get('learning', fn () => Inertia::render('teacher/my-learning'))
            ->name('learning.index');
        Route::get('profile', fn () => Inertia::render('teacher/profile'))
            ->name('profile.show');
        Route::get('settings', fn () => Inertia::render('teacher/settings'))
            ->name('settings.show');
        Route::get('notifications', fn () => Inertia::render('teacher/notifications'))
            ->name('notifications.index');
    });
