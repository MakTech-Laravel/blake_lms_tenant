<?php

use App\Http\Controllers\Teacher\CertificateController;
use App\Http\Controllers\Teacher\CourseController;
use Illuminate\Support\Facades\Route;

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
    });
