<?php

namespace App\Support\Billing;

use App\Enums\BillingInterval;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use Illuminate\Contracts\Support\Responsable;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Checkout;

/**
 * Builds a Stripe Checkout session for a school's commercial subscription.
 */
class SubscriptionCheckout
{
    public const SUBSCRIPTION_NAME = 'default';

    public function redirect(
        School $school,
        Subscription $schoolSubscription,
        BillingInterval $interval,
        string $successUrl,
        string $cancelUrl,
    ): Checkout|Responsable {
        $schoolSubscription->loadMissing('plan');

        $priceId = $this->resolvePriceId(
            $schoolSubscription->plan,
            $schoolSubscription,
            $interval,
        );

        $school->createOrGetStripeCustomer();

        $builder = $school
            ->newSubscription(self::SUBSCRIPTION_NAME, $priceId)
            ->withMetadata([
                'school_id' => (string) $school->id,
                'school_subscription_id' => (string) $schoolSubscription->id,
                'plan_id' => (string) $schoolSubscription->plan_id,
            ]);

        if ($schoolSubscription->trial_days > 0) {
            $builder->trialDays($schoolSubscription->trial_days);
        }

        /** @var Checkout $checkout */
        $checkout = $builder->checkout([
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'school_id' => (string) $school->id,
                'school_subscription_id' => (string) $schoolSubscription->id,
                'plan_id' => (string) $schoolSubscription->plan_id,
            ],
        ]);

        $schoolSubscription->update([
            'billing_interval' => $interval,
            'stripe_price_id' => $priceId,
        ]);

        return $checkout;
    }

    private function resolvePriceId(
        Plan $plan,
        Subscription $schoolSubscription,
        BillingInterval $interval,
    ): string {
        if (! $plan->hasCustomPricing()) {
            $priceId = $plan->stripePriceIdFor($interval);

            if ($priceId === null) {
                throw new \RuntimeException("Plan [{$plan->slug}] has no Stripe price for {$interval->value} billing.");
            }

            return $priceId;
        }

        if (blank($plan->stripe_product_id)) {
            throw new \RuntimeException("Plan [{$plan->slug}] has no Stripe product configured.");
        }

        $amount = $interval === BillingInterval::Annual
            ? (float) $schoolSubscription->monthly_price * 12
            : (float) $schoolSubscription->monthly_price;

        $stripe = Cashier::stripe();

        $price = $stripe->prices->create([
            'product' => $plan->stripe_product_id,
            'unit_amount' => (int) round($amount * 100),
            'currency' => config('cashier.currency'),
            'recurring' => ['interval' => $interval->stripeInterval()],
            'metadata' => [
                'school_id' => (string) $schoolSubscription->school_id,
                'school_subscription_id' => (string) $schoolSubscription->id,
                'plan_id' => (string) $plan->id,
                'billing_interval' => $interval->value,
            ],
        ]);

        return $price->id;
    }
}
