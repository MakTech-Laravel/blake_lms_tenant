<?php

namespace App\Support\Notifications;

/**
 * Base class for the notifications domain code raises, so they read like
 * Laravel's own notification classes without going through the framework's
 * database channel.
 *
 *   final class CertificateExpiring extends AppNotification
 *   {
 *       public function __construct(private readonly Certificate $certificate) {}
 *
 *       public function toMessage(): NotificationMessage
 *       {
 *           return NotificationMessage::make()
 *               ->title('Certificate expiring soon')
 *               ->body("{$this->certificate->holder_name}'s cert expires in 14 days.")
 *               ->category(NotificationCategory::Certificate)
 *               ->priority(NotificationPriority::High);
 *       }
 *
 *       public function audience(): AudienceSelection
 *       {
 *           return AudienceSelection::individuals([$this->certificate->user_id]);
 *       }
 *   }
 *
 * Raised with `Notifier::notify(new CertificateExpiring($cert))`, or addressed
 * explicitly with `$user->notifyWith(new CertificateExpiring($cert))`.
 */
abstract class AppNotification
{
    /**
     * What the notification says.
     */
    abstract public function toMessage(): NotificationMessage;

    /**
     * Who it goes to by default. Return NULL to require the audience be supplied
     * at the call site, which is the right choice for notifications whose
     * recipient depends on context.
     */
    public function audience(): ?AudienceSelection
    {
        return null;
    }
}
