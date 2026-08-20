<?php

namespace App\Support\Notifications;

use App\Enums\NotificationAudience;
use App\Enums\NotificationStatus;
use App\Jobs\DispatchNotification;
use App\Models\Notification;
use App\Models\User;
use Carbon\CarbonInterface;
use LogicException;

/**
 * The single write path for notifications.
 *
 * Every route into the system funnels through here so that the audience label,
 * the status transitions, and the fan-out all happen in exactly one place. The
 * controllers use the instance methods; domain code uses the static `notify()`
 * helpers, which are this system's answer to `$user->notify(...)`.
 *
 *   // From a controller, with an explicit intent from the builder
 *   $notifier->draft($message, $audience, $author);
 *   $notifier->schedule($message, $audience, $when, $author);
 *   $notifier->send($message, $audience, $author);
 *
 *   // From domain code
 *   Notifier::notify(new CertificateExpiring($certificate));
 *   Notifier::notifyUser($user, new CertificateExpiring($certificate));
 */
class Notifier
{
    public function __construct(private readonly AudienceResolver $resolver) {}

    /**
     * Save without sending.
     */
    public function draft(
        NotificationMessage|AppNotification $message,
        AudienceSelection $audience,
        ?User $sender = null,
    ): Notification {
        return $this->create($message, $audience, NotificationStatus::Draft, null, $sender);
    }

    /**
     * Queue for a future time. The `notifications:dispatch-scheduled` command
     * picks it up once `$at` has passed.
     */
    public function schedule(
        NotificationMessage|AppNotification $message,
        AudienceSelection $audience,
        CarbonInterface $at,
        ?User $sender = null,
    ): Notification {
        return $this->create($message, $audience, NotificationStatus::Scheduled, $at, $sender);
    }

    /**
     * Create and fan out immediately.
     */
    public function send(
        NotificationMessage|AppNotification $message,
        AudienceSelection $audience,
        ?User $sender = null,
    ): Notification {
        $notification = $this->create($message, $audience, NotificationStatus::Sending, null, $sender);

        return $this->dispatch($notification);
    }

    /**
     * Rewrite an existing announcement that has not gone out yet.
     */
    public function revise(
        Notification $notification,
        NotificationMessage|AppNotification $message,
        AudienceSelection $audience,
        ?CarbonInterface $scheduledAt = null,
    ): Notification {
        if (! $notification->isEditable()) {
            throw new LogicException('A notification that has already been delivered cannot be revised.');
        }

        $notification->update([
            ...$this->resolveMessage($message)->toAttributes(),
            ...$this->audienceAttributes($audience),
            'status' => $scheduledAt !== null
                ? NotificationStatus::Scheduled
                : NotificationStatus::Draft,
            'scheduled_at' => $scheduledAt,
        ]);

        return $notification->refresh();
    }

    /**
     * Hand an existing announcement to the fan-out job.
     *
     * Flipping to Sending before queueing is what stops a double click, or the
     * scheduler overlapping with a manual send, from queueing the work twice.
     */
    public function dispatch(Notification $notification): Notification
    {
        if (! $notification->isSendable() && $notification->status !== NotificationStatus::Sending) {
            throw new LogicException('This notification is not in a sendable state.');
        }

        $notification->update([
            'status' => NotificationStatus::Sending,
            'scheduled_at' => null,
        ]);

        DispatchNotification::dispatch($notification->id);

        return $notification->refresh();
    }

    /**
     * How many people an audience currently reaches.
     */
    public function estimate(AudienceSelection $audience): int
    {
        return $this->resolver->count($audience);
    }

    /**
     * The human summary an audience would be stored with.
     */
    public function describe(AudienceSelection $audience): string
    {
        return $this->resolver->describe($audience);
    }

    /**
     * Raise a notification from domain code, using its own audience unless one
     * is supplied. The `notify()` analogue.
     */
    public static function notify(
        NotificationMessage|AppNotification $message,
        ?AudienceSelection $audience = null,
        ?User $sender = null,
    ): Notification {
        $audience ??= $message instanceof AppNotification ? $message->audience() : null;

        if ($audience === null) {
            throw new LogicException('No audience was given and the notification does not define one.');
        }

        return app(self::class)->send($message, $audience, $sender);
    }

    /**
     * Raise a notification addressed to one person.
     */
    public static function notifyUser(
        User $recipient,
        NotificationMessage|AppNotification $message,
        ?User $sender = null,
    ): Notification {
        return app(self::class)->send(
            $message,
            AudienceSelection::individuals([$recipient->id]),
            $sender,
        );
    }

    /**
     * Persist a new announcement in the given state.
     */
    private function create(
        NotificationMessage|AppNotification $message,
        AudienceSelection $audience,
        NotificationStatus $status,
        ?CarbonInterface $scheduledAt,
        ?User $sender,
    ): Notification {
        return Notification::create([
            ...$this->resolveMessage($message)->toAttributes(),
            ...$this->audienceAttributes($audience),
            'school_id' => $audience->schoolId,
            'created_by' => $sender?->id,
            'status' => $status,
            'scheduled_at' => $scheduledAt,
        ]);
    }

    /**
     * @return array{audience_type: NotificationAudience, audience: array<string, array<int, int>>|null, audience_label: string}
     */
    private function audienceAttributes(AudienceSelection $audience): array
    {
        return [
            'audience_type' => $audience->type,
            'audience' => $audience->payload(),
            'audience_label' => $this->resolver->describe($audience),
        ];
    }

    private function resolveMessage(NotificationMessage|AppNotification $message): NotificationMessage
    {
        return $message instanceof AppNotification ? $message->toMessage() : $message;
    }
}
