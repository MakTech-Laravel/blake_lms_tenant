<?php

namespace App\Enums;

/**
 * Where an announcement sits in its authoring and delivery lifecycle.
 *
 * Stored rather than derived: a scheduled announcement whose time has passed is
 * not automatically "sent", it is sent once the dispatch job has actually
 * written the recipient rows, and that transition has to be recorded.
 *
 * Archived is the author retiring a sent announcement from the working list. It
 * is deliberately separate from a soft delete, which is throwing it away.
 */
enum NotificationStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Sending = 'sending';
    case Sent = 'sent';
    case Failed = 'failed';
    case Archived = 'archived';

    /**
     * Display label. Must match the keys in the frontend StatusBadge tone map.
     */
    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Scheduled => 'Scheduled',
            self::Sending => 'Sending',
            self::Sent => 'Sent',
            self::Failed => 'Failed',
            self::Archived => 'Archived',
        };
    }

    /**
     * Whether the content and audience can still be changed.
     *
     * Once recipients hold a copy, editing would rewrite what they already read,
     * so a sent announcement is frozen. A failed one is editable again because
     * nothing was delivered.
     */
    public function isEditable(): bool
    {
        return match ($this) {
            self::Draft, self::Scheduled, self::Failed => true,
            self::Sending, self::Sent, self::Archived => false,
        };
    }

    /**
     * Whether "Send now" applies. Sending is excluded so a double click cannot
     * queue the fan-out twice.
     */
    public function isSendable(): bool
    {
        return match ($this) {
            self::Draft, self::Scheduled, self::Failed => true,
            self::Sending, self::Sent, self::Archived => false,
        };
    }

    /**
     * Whether recipients have been written for this announcement.
     */
    public function hasBeenDelivered(): bool
    {
        return match ($this) {
            self::Sent, self::Archived => true,
            self::Draft, self::Scheduled, self::Sending, self::Failed => false,
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status): array => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $status): string => $status->value, self::cases());
    }
}
