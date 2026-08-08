<?php

namespace App\Mail;

use App\Enums\NotificationPriority;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The email copy of an announcement, sent only when the author turned the mail
 * channel on. The in-app notification is always the record of what was sent;
 * this is a nudge towards it.
 */
class AnnouncementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Notification $notification,
        public readonly User $recipient,
    ) {}

    public function envelope(): Envelope
    {
        // Urgent announcements are prefixed rather than relying on a priority
        // header, which most clients quietly ignore.
        $subject = $this->notification->priority === NotificationPriority::Urgent
            ? '[Urgent] '.$this->notification->title
            : $this->notification->title;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.announcement',
            with: [
                'title' => $this->notification->title,
                'body' => $this->notification->body,
                'categoryLabel' => $this->notification->category->label(),
                'priority' => $this->notification->priority,
                'actionLabel' => $this->notification->action_label,
                'actionUrl' => $this->notification->action_url,
                'recipientName' => $this->recipient->name,
                'inboxUrl' => route('notifications.index'),
                'senderName' => $this->notification->school?->name ?? config('app.name'),
            ],
        );
    }
}
