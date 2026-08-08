<?php

namespace App\Enums;

/**
 * How loudly an announcement should present itself.
 *
 * Urgent items sort ahead of everything else in a recipient's inbox and carry a
 * red badge; normal ones are ordered purely by when they were sent.
 */
enum NotificationPriority: string
{
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    public function label(): string
    {
        return match ($this) {
            self::Normal => 'Normal',
            self::High => 'High',
            self::Urgent => 'Urgent',
        };
    }

    /**
     * Sort weight, highest first. Used to lift urgent items to the top of an
     * inbox without a second query.
     */
    public function weight(): int
    {
        return match ($this) {
            self::Normal => 0,
            self::High => 1,
            self::Urgent => 2,
        };
    }

    /**
     * Whether the priority is worth surfacing as a badge at all. Normal is the
     * default and would only add noise.
     */
    public function isElevated(): bool
    {
        return $this !== self::Normal;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $priority): array => ['value' => $priority->value, 'label' => $priority->label()],
            self::cases(),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $priority): string => $priority->value, self::cases());
    }
}
