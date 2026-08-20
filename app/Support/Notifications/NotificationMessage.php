<?php

namespace App\Support\Notifications;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use InvalidArgumentException;

/**
 * The content half of a notification: what it says, how loudly, and over which
 * channels. Deliberately knows nothing about who receives it, which is
 * AudienceSelection's job.
 *
 * Fluent so domain code reads like Laravel's own notification classes:
 *
 *   NotificationMessage::make()
 *       ->title('Certificate expiring soon')
 *       ->body("Tom Barker's Lifeguard cert expires in 14 days.")
 *       ->category(NotificationCategory::Certificate)
 *       ->priority(NotificationPriority::High)
 *       ->action('View certificate', route('platform.certificates.index'))
 *       ->alsoByEmail();
 */
class NotificationMessage
{
    private string $title = '';

    private string $body = '';

    private NotificationCategory $category = NotificationCategory::Announcement;

    private NotificationPriority $priority = NotificationPriority::Normal;

    private ?string $actionLabel = null;

    private ?string $actionUrl = null;

    /**
     * In-app is always included; see `channelValues()`.
     *
     * @var array<int, NotificationChannel>
     */
    private array $channels = [NotificationChannel::Database];

    public static function make(string $title = '', string $body = ''): self
    {
        return (new self)->title($title)->body($body);
    }

    public function title(string $title): self
    {
        $this->title = trim($title);

        return $this;
    }

    public function body(string $body): self
    {
        $this->body = trim($body);

        return $this;
    }

    public function category(NotificationCategory $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function priority(NotificationPriority $priority): self
    {
        $this->priority = $priority;

        return $this;
    }

    /**
     * Attach an optional deep link, rendered as a button in the bell and email.
     * Both halves are required together; either being blank drops the action.
     */
    public function action(?string $label, ?string $url): self
    {
        $label = $label !== null ? trim($label) : null;
        $url = $url !== null ? trim($url) : null;

        $usable = $label !== null && $label !== '' && $url !== null && $url !== '';

        $this->actionLabel = $usable ? $label : null;
        $this->actionUrl = $usable ? $url : null;

        return $this;
    }

    /**
     * Replace the channel list. In-app is re-added by `channelValues()` whatever
     * is passed, because the in-app copy is the delivery record.
     *
     * @param  array<int, NotificationChannel|string>  $channels
     */
    public function channels(array $channels): self
    {
        $this->channels = array_values(array_filter(array_map(
            fn (NotificationChannel|string $channel): ?NotificationChannel => $channel instanceof NotificationChannel
                ? $channel
                : NotificationChannel::tryFrom($channel),
            $channels,
        )));

        return $this;
    }

    /**
     * Turn email on (or back off) without disturbing the rest of the list.
     */
    public function alsoByEmail(bool $enabled = true): self
    {
        $others = array_values(array_filter(
            $this->channels,
            fn (NotificationChannel $channel): bool => $channel !== NotificationChannel::Mail,
        ));

        $this->channels = $enabled
            ? [...$others, NotificationChannel::Mail]
            : $others;

        return $this;
    }

    public function titleValue(): string
    {
        return $this->title;
    }

    public function bodyValue(): string
    {
        return $this->body;
    }

    /**
     * The stored channel list, with in-app forced to the front and duplicates
     * removed.
     *
     * @return array<int, string>
     */
    public function channelValues(): array
    {
        $values = array_map(
            fn (NotificationChannel $channel): string => $channel->value,
            $this->channels,
        );

        return array_values(array_unique([
            NotificationChannel::Database->value,
            ...$values,
        ]));
    }

    /**
     * The Notification columns this message owns.
     *
     * @return array{
     *     title: string,
     *     body: string,
     *     category: NotificationCategory,
     *     priority: NotificationPriority,
     *     action_label: string|null,
     *     action_url: string|null,
     *     channels: array<int, string>
     * }
     */
    public function toAttributes(): array
    {
        if ($this->title === '' || $this->body === '') {
            throw new InvalidArgumentException('A notification needs both a title and a body.');
        }

        return [
            'title' => $this->title,
            'body' => $this->body,
            'category' => $this->category,
            'priority' => $this->priority,
            'action_label' => $this->actionLabel,
            'action_url' => $this->actionUrl,
            'channels' => $this->channelValues(),
        ];
    }
}
