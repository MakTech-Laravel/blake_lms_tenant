<?php

namespace App\Http\Requests\Notification;

use App\Enums\NotificationAudience;

/**
 * A school author editing their own announcement. See
 * StoreSchoolNotificationRequest for why the audience list is narrowed.
 */
class UpdateSchoolNotificationRequest extends UpdateNotificationRequest
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
