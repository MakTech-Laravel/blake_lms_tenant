<?php

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            // NULL for platform-composed announcements. Set for school-composed
            // ones, which may only ever address their own organization, and
            // which is also how the school list is scoped.
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();

            // The author. Nulled rather than cascaded so deactivating a staff
            // member never erases the history of what they broadcast.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('body');

            $table->string('category')->default(NotificationCategory::Announcement->value)->index();
            $table->string('priority')->default(NotificationPriority::Normal->value)->index();

            // Optional deep link, rendered as a button in the bell and the email.
            $table->string('action_label')->nullable();
            $table->string('action_url')->nullable();

            // Which channels this went out on: ['database'] or ['database','mail'].
            $table->json('channels');

            // The targeting mode and its ids (school_ids / plan_ids / role_ids /
            // user_ids). `audience` is NULL for the self-contained modes such as
            // "all users".
            $table->string('audience_type')->default(NotificationAudience::AllUsers->value)->index();
            $table->json('audience')->nullable();

            // Denormalized human summary of the audience, resolved once at
            // authoring time. Kept so the list and the export still read
            // correctly after a targeted organization or role is deleted.
            $table->string('audience_label');

            $table->string('status')->default(NotificationStatus::Draft->value)->index();

            // When a scheduled announcement should go out. The dispatch command
            // polls on this, hence the index.
            $table->timestamp('scheduled_at')->nullable()->index();
            $table->timestamp('sent_at')->nullable();

            // Fan-out size, written once the dispatch job has finished. Stored
            // rather than counted so the list does not need a join per row.
            $table->unsignedInteger('recipients_count')->default(0);

            $table->timestamps();

            // Archiving is a status (its own tab in the UI). Soft deleting is the
            // author discarding the announcement, which must not take the
            // recipients' copies with it.
            $table->softDeletes();

            // The list is always filtered by status and ordered by recency.
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
