<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: create_attachments_table
 *
 * Place at:  database/migrations/2024_01_01_000002_create_attachments_table.php
 *
 * FIX: post_id is now NULLABLE so standalone uploads (demo §1) don't need a post.
 *
 * If you already ran the old migration, roll it back first:
 *   php artisan migrate:rollback --step=1
 * Then re-run:
 *   php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();

            // Nullable — standalone uploads (no post context) are allowed.
            // When a post IS provided the FK is enforced at the app level.
            $table->foreignId('post_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();   // set to NULL if parent post is deleted

            // Storage-relative path on the 'public' disk
            // e.g.  uploads/AbCdEf.jpg  OR  posts/1/attachments/AbCdEf.jpg
            $table->string('path');

            // Original filename as supplied by the browser
            $table->string('original_name');

            // MIME type detected server-side
            $table->string('mime_type', 100);

            // File size in bytes — used by the UI for display
            $table->unsignedBigInteger('size');

            // Optional human-readable label from the upload form
            $table->string('label')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
