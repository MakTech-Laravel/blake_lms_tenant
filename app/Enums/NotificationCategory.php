<?php

namespace App\Enums;

/**
 * What an announcement is about.
 *
 * Drives the icon on the notification row and in the bell, and gives the list a
 * useful filter once the archive grows past a screenful.
 */
enum NotificationCategory: string
{
    case Announcement = 'announcement';
    case SystemAlert = 'system_alert';
    case Compliance = 'compliance';
    case Billing = 'billing';
    case Course = 'course';
    case Certificate = 'certificate';

    public function label(): string
    {
        return match ($this) {
            self::Announcement => 'Announcement',
            self::SystemAlert => 'System Alert',
            self::Compliance => 'Compliance',
            self::Billing => 'Billing',
            self::Course => 'Course',
            self::Certificate => 'Certificate',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $category): array => ['value' => $category->value, 'label' => $category->label()],
            self::cases(),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $category): string => $category->value, self::cases());
    }
}
