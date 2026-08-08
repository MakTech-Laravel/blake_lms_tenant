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
        Route::get('certificates/{certificate}/download', [CertificateController::class, 'download'])
            ->name('certificates.download');
        Route::get('certificates/{certificate}/preview', [CertificateController::class, 'preview'])
            ->name('certificates.preview');

        Route::get('learning', fn () => Inertia::render('teacher/my-learning'))
            ->name('learning.index');
        Route::get('profile', fn () => Inertia::render('teacher/profile'))
            ->name('profile.show');
        Route::get('settings', fn () => Inertia::render('teacher/settings'))
            ->name('settings.show');
        // Teachers use the same personal inbox as everyone else; this keeps the
        // sidebar's /dashboard/notifications link working.
        Route::get('notifications', fn () => redirect()->route('notifications.index'))
            ->name('notifications.index');
    });
