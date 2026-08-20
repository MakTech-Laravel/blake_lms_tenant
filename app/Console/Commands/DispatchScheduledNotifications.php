<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Support\Notifications\Notifier;
use Illuminate\Console\Command;

/**
 * Sends the announcements whose scheduled time has arrived.
 *
 * Registered on the scheduler to run every minute, so production needs
 * `php artisan schedule:run` on cron for scheduled sends to fire at all.
 *
 * Idempotent by construction: Notifier::dispatch() flips each row to Sending
 * before queueing, and `scopeDue()` only matches rows still marked Scheduled, so
 * an overlapping run finds nothing left to do.
 */
class DispatchScheduledNotifications extends Command
{
    protected $signature = 'notifications:dispatch-scheduled';

    protected $description = 'Send any scheduled announcements that are now due';

    public function handle(Notifier $notifier): int
    {
        $due = Notification::query()->due()->orderBy('scheduled_at')->get();

        if ($due->isEmpty()) {
            $this->info('No scheduled notifications are due.');

            return self::SUCCESS;
        }

        foreach ($due as $notification) {
            $notifier->dispatch($notification);

            $this->line('Dispatched: '.$notification->title);
        }

        $this->info($due->count().' scheduled notification(s) dispatched.');

        return self::SUCCESS;
    }
}
