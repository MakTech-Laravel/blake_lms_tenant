<?php

namespace App\Models\Concerns;

use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\User;
use App\Support\Notifications\AppNotification;
use App\Support\Notifications\AudienceSelection;
use App\Support\Notifications\NotificationMessage;
use App\Support\Notifications\Notifier;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * The recipient half of the notification system: one user's inbox.
 *
 * Every method here operates on the notification_user pivot, never on the
 * notification itself, which is shared. That is what makes "delete" mean "hide
 * my copy" rather than "unsend it for everybody".
 *
 * Named `appNotifications` rather than `notifications` on purpose: the framework's
 * Notifiable trait already owns that name for its own database channel, and it
 * stays on User because Fortify's password-reset and verification mail rides on
 * it.
 *
 * @mixin User
 */
trait ReceivesNotifications
{
    /**
     * Announcements this user still holds a copy of, newest first, with urgent
     * items lifted to the top.
     */
    public function appNotifications(): BelongsToMany
    {
        return $this->belongsToMany(Notification::class, 'notification_user')
            ->using(NotificationRecipient::class)
            ->withPivot(['id', 'read_at', 'archived_at', 'emailed_at'])
            ->withTimestamps()
            ->wherePivotNull('deleted_at');
    }

    /**
     * The raw delivery rows, for counting and for bulk updates that would be
     * wasteful through the relation above.
     */
    public function notificationReceipts(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

    /**
     * Unread count for the header badge. Backed by the
     * (user_id, read_at) index, since this runs on every request.
     */
    public function unreadNotificationCount(): int
    {
        return $this->notificationReceipts()
            ->unread()
            ->inbox()
            ->whereHas('notification')
            ->count();
    }

    /**
     * This user's copy of an announcement, or NULL if they were never a
     * recipient or have since deleted it.
     */
    public function notificationReceipt(Notification|int $notification): ?NotificationRecipient
    {
        return $this->notificationReceipts()
            ->where('notification_id', $notification instanceof Notification ? $notification->id : $notification)
            ->first();
    }

    /**
     * Mark one copy read. Returns false when the user holds no such copy.
     */
    public function markNotificationRead(Notification|int $notification): bool
    {
        $receipt = $this->notificationReceipt($notification);

        $receipt?->markRead();

        return $receipt !== null;
    }

    public function markNotificationUnread(Notification|int $notification): bool
    {
        $receipt = $this->notificationReceipt($notification);

        $receipt?->markUnread();

        return $receipt !== null;
    }

    /**
     * Clear the badge in one statement. Returns how many were affected.
     *
     * Scoped exactly as the badge counts, so the number reported back matches
     * the number that was showing. Archived copies are left alone: the user
     * filed those away deliberately, and they are not what the badge counts.
     */
    public function markAllNotificationsRead(): int
    {
        return $this->notificationReceipts()
            ->unread()
            ->inbox()
            ->whereHas('notification')
            ->update(['read_at' => now()]);
    }

    /**
     * Move a copy out of the main inbox without losing it.
     */
    public function archiveNotification(Notification|int $notification): bool
    {
        $receipt = $this->notificationReceipt($notification);

        // Archiving implies having seen it, so the badge should not keep counting
        // something the user has deliberately filed away.
        $receipt?->update([
            'archived_at' => now(),
            'read_at' => $receipt->read_at ?? now(),
        ]);

        return $receipt !== null;
    }

    public function unarchiveNotification(Notification|int $notification): bool
    {
        $receipt = $this->notificationReceipt($notification);

        $receipt?->update(['archived_at' => null]);

        return $receipt !== null;
    }

    /**
     * Delete this user's copy and nobody else's. The announcement itself, and
     * every other recipient's copy, are untouched.
     */
    public function forgetNotification(Notification|int $notification): bool
    {
        $receipt = $this->notificationReceipt($notification);

        $receipt?->delete();

        return $receipt !== null;
    }

    /**
     * Send this user a notification. The closest analogue to `notify()`, and the
     * form domain code should reach for when the recipient is a single person.
     */
    public function notifyWith(
        NotificationMessage|AppNotification $message,
        ?User $sender = null,
    ): Notification {
        return app(Notifier::class)->send(
            $message,
            AudienceSelection::individuals([$this->id]),
            $sender,
        );
    }
}
