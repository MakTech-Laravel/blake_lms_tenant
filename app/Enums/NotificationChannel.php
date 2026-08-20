<?php

namespace App\Enums;

/**
 * How an announcement reaches its recipients.
 *
 * Database is always on: the in-app inbox is the record of what was sent, and
 * the read receipts hang off it. Mail is opt-in per announcement.
 */
enum NotificationChannel: string
{
    case Database = 'database';
    case Mail = 'mail';

    public function label(): string
    {
        return match ($this) {
            self::Database => 'In-app',
            self::Mail => 'Email',
        };
    }

    /**
     * Whether this channel can be turned off in the builder.
     */
    public function isOptional(): bool
    {
        return $this !== self::Database;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $channel): array => ['value' => $channel->value, 'label' => $channel->label()],
            self::cases(),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $channel): string => $channel->value, self::cases());
    }

    /**
     * Human summary of a stored channel list, e.g. "In-app, Email".
     *
     * @param  array<int, string>  $channels
     */
    public static function labelFor(array $channels): string
    {
        $labels = array_values(array_filter(array_map(
            fn (string $channel): ?string => self::tryFrom($channel)?->label(),
            $channels,
        )));

        return $labels === [] ? self::Database->label() : implode(', ', $labels);
    }
}
