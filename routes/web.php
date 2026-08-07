<?php

use App\Enums\PermissionEnum;
use App\Http\Controllers\FileUploadDemoController;
use App\Http\Controllers\IconPickerDemoController;
use App\Http\Controllers\PostAttachmentController;
use App\Http\Controllers\Teacher\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Universal entry point: dispatches each account type to its dashboard.
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // ── Demo landing page ─────────────────────────────────────────────────────
    Route::get('/file-upload-demo', [FileUploadDemoController::class, 'index'])
        ->name('file-upload-demo.index')->middleware('permission:'.PermissionEnum::FILE_UPLOAD_INDEX->value);

    // ── Single / multiple file upload (used by demos 1 & 2) ──────────────────
    Route::post('/upload', [FileUploadDemoController::class, 'store'])
        ->name('upload.store')->middleware('permission:'.PermissionEnum::FILE_UPLOAD_STORE->value);

    // ── Edit-mode endpoint (demo 3) ───────────────────────────────────────────
    Route::post('/posts/{post}', [PostAttachmentController::class, 'update'])
        ->name('posts.update')->middleware('permission:'.PermissionEnum::POSTS_EDIT->value);

    // ── Icon picker demo ──────────────────────────────────────────────────────
    Route::get('/icon-picker-demo', [IconPickerDemoController::class, 'index'])
        ->name('icon-picker-demo.index')->middleware('permission:'.PermissionEnum::ICON_PICKER_INDEX->value);
    Route::post('/icon-picker-demo', [IconPickerDemoController::class, 'store'])
        ->name('icon-picker-demo.store')->middleware('permission:'.PermissionEnum::ICON_PICKER_STORE->value);
});

require __DIR__.'/platform.php';
require __DIR__.'/school.php';
require __DIR__.'/teacher.php';
require __DIR__.'/settings.php';
