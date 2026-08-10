<?php

namespace App\Support\Billing;

use App\Enums\SchoolStatus;
use App\Models\School;
use App\Models\Subscription;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Subscription as CashierSubscription;

/**
 * Mirrors Cashier subscription state onto the commercial school_subscriptions row
 * and keeps the organization's account status aligned with Stripe.
 */
class SyncSchoolSubscriptionFromStripe
{
    public function sync(School $school, ?Subscription $schoolSubscription = null): void
    {
        $schoolSubscription ??= $school->schoolSubscription;

        if ($schoolSubscription === null) {
            return;
        }

        /** @var CashierSubscription|null $cashierSubscription */
        $cashierSubscription = $school->subscription(SubscriptionCheckout::SUBSCRIPTION_NAME);

        if ($cashierSubscription === null) {
            return;
        }

        $stripeSubscription = $cashierSubscription->asStripeSubscription();

        $schoolSubscription->update([
            'trial_ends_at' => $cashierSubscription->trial_ends_at,
            'renews_at' => isset($stripeSubscription->current_period_end)
                ? Carbon::createFromTimestamp($stripeSubscription->current_period_end)
                : $schoolSubscription->renews_at,
            'canceled_at' => $cashierSubscription->ends_at,
            'stripe_status' => $cashierSubscription->stripe_status,
            'stripe_price_id' => $cashierSubscription->stripe_price,
        ]);

        $school->update([
            'status' => $this->resolveSchoolStatus($cashierSubscription),
        ]);
    }

    public function syncFromPayload(array $payload): void
    {
        $school = $this->resolveSchool($payload);

        if ($school === null) {
            return;
        }

        $this->sync($school);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveSchool(array $payload): ?School
    {
        $metadata = data_get($payload, 'data.object.metadata', []);

        if (filled($metadata['school_id'] ?? null)) {
            return School::query()->find((int) $metadata['school_id']);
        }

        $customerId = data_get($payload, 'data.object.customer');

        if (is_string($customerId) && $customerId !== '') {
            return School::query()->where('stripe_id', $customerId)->first();
        }

        return null;
    }

    private function resolveSchoolStatus(CashierSubscription $cashierSubscription): SchoolStatus
    {
        return match ($cashierSubscription->stripe_status) {
            'trialing' => SchoolStatus::Trial,
            'active' => SchoolStatus::Active,
            default => SchoolStatus::Suspended,
        };
    }
}
