<?php

namespace App\Support\Billing;

use App\Enums\BillingInterval;
use App\Enums\PlanPricing;
use App\Models\Plan;
use Laravel\Cashier\Cashier;
use Stripe\Exception\ApiErrorException;
use Stripe\Price;
use Stripe\Product;
use Stripe\StripeClient;

/**
 * Keeps fixed plans mirrored as Stripe Products and Prices, and custom plans
 * as Products only. No-ops when Stripe is not configured so tests stay offline.
 */
class StripePlanSync
{
    public function sync(Plan $plan): void
    {
        if (blank(config('cashier.secret'))) {
            return;
        }

        $stripe = Cashier::stripe();

        $product = $this->syncProduct($stripe, $plan);

        $plan->forceFill(['stripe_product_id' => $product->id])->save();

        if ($plan->pricing_type === PlanPricing::Custom) {
            return;
        }

        $monthlyPriceId = $this->syncPrice(
            $stripe,
            $plan,
            BillingInterval::Monthly,
            $plan->monthly_price,
            $product->id,
        );

        $annualPriceId = null;

        if ($plan->annual_price !== null) {
            $annualPriceId = $this->syncPrice(
                $stripe,
                $plan,
                BillingInterval::Annual,
                $plan->annual_price,
                $product->id,
            );
        }

        $plan->forceFill([
            'stripe_monthly_price_id' => $monthlyPriceId,
            'stripe_annual_price_id' => $annualPriceId,
        ])->save();
    }

    /**
     * @param  StripeClient  $stripe
     */
    private function syncProduct(mixed $stripe, Plan $plan): Product
    {
        if (filled($plan->stripe_product_id)) {
            return $stripe->products->update($plan->stripe_product_id, [
                'name' => $plan->name,
                'description' => $plan->description,
                'active' => $plan->is_active && ! $plan->trashed(),
                'metadata' => [
                    'plan_id' => (string) $plan->id,
                    'plan_slug' => $plan->slug,
                ],
            ]);
        }

        return $stripe->products->create([
            'name' => $plan->name,
            'description' => $plan->description,
            'active' => $plan->is_active && ! $plan->trashed(),
            'metadata' => [
                'plan_id' => (string) $plan->id,
                'plan_slug' => $plan->slug,
            ],
        ]);
    }

    /**
     * @param  StripeClient  $stripe
     *
     * @throws ApiErrorException
     */
    private function syncPrice(
        mixed $stripe,
        Plan $plan,
        BillingInterval $interval,
        float|string|null $amount,
        string $productId,
    ): ?string {
        if ($amount === null) {
            return null;
        }

        $existingPriceId = $plan->stripePriceIdFor($interval);
        $amountInCents = (int) round(((float) $amount) * 100);

        if ($existingPriceId !== null) {
            /** @var Price $existingPrice */
            $existingPrice = $stripe->prices->retrieve($existingPriceId);

            if (
                (int) $existingPrice->unit_amount === $amountInCents
                && $existingPrice->recurring?->interval === $interval->stripeInterval()
            ) {
                return $existingPriceId;
            }

            $stripe->prices->update($existingPriceId, ['active' => false]);
        }

        $price = $stripe->prices->create([
            'product' => $productId,
            'unit_amount' => $amountInCents,
            'currency' => config('cashier.currency'),
            'recurring' => ['interval' => $interval->stripeInterval()],
            'metadata' => [
                'plan_id' => (string) $plan->id,
                'plan_slug' => $plan->slug,
                'billing_interval' => $interval->value,
            ],
        ]);

        return $price->id;
    }
}
