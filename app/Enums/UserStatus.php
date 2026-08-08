<?php

namespace App\Enums;

/**
 * Account status for directory UIs (Platform People / Platform Staff).
 */
enum UserStatus: string
{
    case Active = 'active';
    case Pending = 'pending';
    case Disabled = 'disabled';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Pending => 'Pending',
            self::Disabled => 'Disabled',
        };
    }
}
