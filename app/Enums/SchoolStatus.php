<?php

namespace App\Enums;

/**
 * Account lifecycle for a school (Organizations UI).
 *
 * Trial organizations retain full access; only Suspended is locked out of the
 * tenant dashboard by ResolveTenant.
 */
enum SchoolStatus: string
{
    case Active = 'active';
    case Trial = 'trial';
    case Suspended = 'suspended';

    /**
     * Display label. Must match the keys in the frontend StatusBadge tone map.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Trial => 'Trial',
            self::Suspended => 'Suspended',
        };
    }

    /**
     * Whether the organization contributes to monthly recurring revenue.
     */
    public function isBillable(): bool
    {
        return $this === self::Active;
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
}
