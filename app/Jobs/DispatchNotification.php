<?php

namespace App\Jobs;

use App\Enums\NotificationStatus;
use App\Models\Notification;
use App\Support\Notifications\AudienceResolver;
use App\Support\Notifications\AudienceSelection;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Writes one recipient row per addressed user, then hands the email off.
 *
 * Takes the notification id rather than the model so a retry always reads the
 * current row instead of a snapshot taken before the previous attempt failed
 * halfway through.
 *
 * Safe to run more than once: the fan-out is an upsert against the
 * (notification_id, user_id) unique index, so a retry tops up whatever the
 * previous attempt missed without duplicating or re-notifying anyone.
 */
class DispatchNotification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public readonly int $notificationId) {}

    public function handle(AudienceResolver $resolver): void
    {
        $notification = Notification::find($this->notificationId);

        // The author deleted it between queueing and running. Nothing to do.
        if ($notification === null) {
            return;
        }

        $selection = AudienceSelection::fromArray([
            'audience_type' => $notification->audience_type,
            'audience' => $notification->audience ?? [],
        ], $notification->school_id);

        $now = now();
        $written = 0;

        $resolver->query($selection)
            ->select('users.id')
            ->orderBy('users.id')
            ->chunkById(Notification::FANOUT_CHUNK, function ($users) use ($notification, $now, &$written): void {
                $rows = $users->map(fn ($user): array => [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all();

                if ($rows === []) {
                    return;
                }

                // Only the timestamps are refreshed on conflict: read_at,
                // archived_at, and deleted_at belong to the recipient and a
                // re-run must not undo what they did with their copy.
                DB::table('notification_user')->upsert(
                    $rows,
                    ['notification_id', 'user_id'],
                    ['updated_at'],
                );

                $written += count($rows);
            }, 'users.id', 'id');

        $notification->update([
            'status' => NotificationStatus::Sent,
            'sent_at' => $notification->sent_at ?? $now,
            'recipients_count' => $written,
        ]);

        if ($notification->sendsEmail() && $written > 0) {
            Bus::dispatch(new SendNotificationEmails($notification->id));
        }
    }

    /**
     * Surface the failure in the UI rather than leaving the row stuck on
     * "Sending" with no explanation.
     */
    public function failed(?Throwable $exception): void
    {
        Notification::whereKey($this->notificationId)
            ->update(['status' => NotificationStatus::Failed->value]);
    }
}
