<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('notification_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->timestamp('read_at')->nullable();

            // The recipient tidying their own inbox. Independent of the author's
            // archive, which is a status on the notification itself.
            $table->timestamp('archived_at')->nullable();

            // Stamped once the email for this recipient has been queued, so a
            // retried dispatch does not mail anyone twice.
            $table->timestamp('emailed_at')->nullable();

            $table->timestamps();

            // A recipient deleting a notification hides their copy and nobody
            // else's, so the delete is soft and scoped to this row.
            $table->softDeletes();

            // Makes the fan-out upsert idempotent when the dispatch job retries.
            $table->unique(['notification_id', 'user_id']);

            // Backs the unread badge count, which runs on every request.
            $table->index(['user_id', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_user');
    }
};
