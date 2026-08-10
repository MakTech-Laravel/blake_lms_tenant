<?php

namespace App\Http\Requests\Organization;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The subscription half of the create and update organization requests.
 *
 * Pricing depends on the chosen plan rather than on the submitted fields: a
 * fixed-price plan bills its own rate and ignores any amount posted, while a
 * custom-priced plan has no list price and so must be given one. Both requests
 * need the same behaviour, and getting it wrong on one of them would let a rate
 * be set where it should be locked.
 *
 * @mixin FormRequest
 */
trait SubscriptionRules
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function subscriptionRules(): array
    {
        return [
            'plan_id' => [
                'nullable',
                'integer',
                // Archived and deactivated plans cannot be newly assigned.
                Rule::exists('plans', 'id')->whereNull('deleted_at')->where('is_active', true),
            ],
            'monthly_price' => [
                Rule::requiredIf(fn (): bool => $this->selectedPlanIsCustomPriced()),
                'nullable',
                'numeric',
                'min:0',
                'max:999999.99',
            ],
            'trial_days' => [
                'nullable',
                'integer',
                'min:'.Subscription::TRIAL_DAYS_MIN,
                'max:'.Subscription::TRIAL_DAYS_MAX,
            ],
            'billing_interval' => [
                'nullable',
                'string',
                Rule::in(['monthly', 'annual']),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function subscriptionMessages(): array
    {
        return [
            'plan_id.exists' => 'That plan is no longer available.',
            'monthly_price.required' => 'This plan is custom-priced, so a monthly rate is required.',
            'trial_days.max' => 'Trials cannot exceed '.Subscription::TRIAL_DAYS_MAX.' days.',
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function subscriptionAttributes(): array
    {
        return [
            'plan_id' => 'plan',
            'monthly_price' => 'monthly rate',
            'trial_days' => 'trial length',
        ];
    }

    /**
     * Whether the submitted plan is quoted per organization, which is the only
     * case where a rate has to be supplied.
     */
    private function selectedPlanIsCustomPriced(): bool
    {
        $planId = $this->input('plan_id');

        if (blank($planId)) {
            return false;
        }

        return Plan::query()
            ->whereKey($planId)
            ->first()
            ?->hasCustomPricing() ?? false;
    }
}
