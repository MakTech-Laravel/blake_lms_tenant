<?php

namespace App\Http\Requests\Plan;

use App\Enums\PlanPricing;
use App\Models\Subscription;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

/**
 * Rules shared by the create and update plan requests.
 *
 * The pricing type drives whether a rate is expected: fixed plans must carry the
 * price everyone on them pays, custom plans deliberately carry none so the rate
 * is quoted per organization.
 *
 * @mixin FormRequest
 */
trait PlanRules
{
    /**
     * Blank out both rates on custom-priced plans so switching a fixed plan to
     * custom cannot leave a stale price behind.
     */
    protected function normalizePricing(): void
    {
        if ($this->input('pricing_type') === PlanPricing::Custom->value) {
            $this->merge(['monthly_price' => null, 'annual_price' => null]);
        }
    }

    /**
     * The form authors features as one per line, which arrives as a single
     * string. Split it into the array the column stores, dropping blank lines so
     * a stray newline does not become an empty bullet.
     */
    protected function normalizeFeatures(): void
    {
        $features = $this->input('features');

        if (! is_string($features)) {
            return;
        }

        $this->merge([
            'features' => array_values(array_filter(
                array_map('trim', preg_split('/\R/', $features) ?: []),
                fn (string $feature): bool => $feature !== '',
            )),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function planRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'pricing_type' => ['required', new Enum(PlanPricing::class)],
            'monthly_price' => [
                'exclude_if:pricing_type,'.PlanPricing::Custom->value,
                'required',
                'numeric',
                'min:0',
                'max:999999.99',
            ],
            'annual_price' => [
                'exclude_if:pricing_type,'.PlanPricing::Custom->value,
                'nullable',
                'numeric',
                'min:0',
                'max:9999999.99',
            ],
            'description' => 'nullable|string|max:255',
            // A blank limit means unlimited, so NULL is valid; a zero limit
            // would mean the plan grants nothing, which is never intended.
            'staff_limit' => 'nullable|integer|min:1|max:1000000',
            'location_limit' => 'nullable|integer|min:1|max:1000000',
            'course_limit' => 'nullable|integer|min:1|max:1000000',
            'storage_gb' => 'nullable|integer|min:1|max:1000000',
            'features' => 'array|max:30',
            'features.*' => 'string|max:120',
            'is_popular' => 'boolean',
            'trial_days' => [
                'required',
                'integer',
                'min:'.Subscription::TRIAL_DAYS_MIN,
                'max:'.Subscription::TRIAL_DAYS_MAX,
            ],
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function planMessages(): array
    {
        return [
            'slug.unique' => 'A plan with that slug already exists.',
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and single hyphens.',
            'monthly_price.required' => 'Fixed-price plans need a monthly rate.',
            'trial_days.max' => 'Trials cannot exceed '.Subscription::TRIAL_DAYS_MAX.' days.',
            'features.max' => 'A plan card can list at most 30 features.',
            'features.*.max' => 'Keep each feature under 120 characters so it fits the card.',
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function planAttributes(): array
    {
        return [
            'pricing_type' => 'pricing type',
            'monthly_price' => 'monthly rate',
            'annual_price' => 'annual rate',
            'staff_limit' => 'staff limit',
            'location_limit' => 'location limit',
            'course_limit' => 'course limit',
            'storage_gb' => 'storage limit',
            'trial_days' => 'trial length',
            'sort_order' => 'display order',
        ];
    }
}
