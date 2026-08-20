<?php

namespace App\Http\Requests\Notification;

use App\Enums\NotificationAudience;

/**
 * A school author's announcement.
 *
 * Identical to the platform request except that the cross-organization audience
 * modes are refused outright. The AudienceResolver would clamp them to this
 * school anyway, but rejecting them is honest: "All Platform Users" scoped to one
 * school silently means nobody.
 */
class StoreSchoolNotificationRequest extends StoreNotificationRequest
{
    /**
     * @return array<int, string>
     */
    protected function allowedAudienceValues(): array
    {
        return array_map(
            fn (NotificationAudience $audience): string => $audience->value,
            NotificationAudience::schoolCases(),
        );
    }
}
