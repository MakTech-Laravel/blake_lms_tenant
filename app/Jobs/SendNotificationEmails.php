<?php

namespace App\Jobs;

use App\Mail\AnnouncementMail;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

/**
 * Emails the recipients of an announcement that opted into the mail channel.
 *
 * Split from DispatchNotification so a mail-server outage cannot leave the
 * in-app copies half written: by the time this runs, every recipient already
 * holds their notification and the worst case is a retried email.
 *
 * `emailed_at` is stamped per recipient as each message is queued, so a retry
 * resumes where it stopped instead of mailing the whole audience again.
 */
class SendNotificationEmails implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(public readonly int $notificationId) {}

    public function handle(): void
    {
        $notification = Notification::find($this->notificationId);

        if ($notification === null || ! $notification->sendsEmail()) {
            return;
        }

        NotificationRecipient::query()
            ->where('notification_id', $notification->id)
            ->whereNull('emailed_at')
            ->with('user')
            ->chunkById(Notification::FANOUT_CHUNK, function ($receipts) use ($notification): void {
                foreach ($receipts as $receipt) {
                    $email = $receipt->user?->email;

                    // Stamped either way: an address we cannot mail is not worth
                    // re-examining on every retry.
                    if ($email !== null) {
                        Mail::to($email)->queue(new AnnouncementMail($notification, $receipt->user));
                    }

                    $receipt->update(['emailed_at' => now()]);
                }
            });
    }
}
