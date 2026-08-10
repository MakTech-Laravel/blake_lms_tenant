<?php

namespace Database\Factories;

use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'plan_id' => Plan::factory(),
            'monthly_price' => fake()->randomElement([290, 590, 990]),
            'trial_days' => 0,
            'trial_ends_at' => null,
            'renews_at' => fake()->dateTimeBetween('+1 month', '+1 year'),
            'canceled_at' => null,
            'billing_interval' => 'monthly',
        ];
    }

    /**
     * Attach the subscription to an existing organization.
     */
    public function forSchool(School $school): static
    {
        return $this->state(fn (array $attributes): array => [
            'school_id' => $school->id,
        ]);
    }

    /**
     * Price the subscription against a plan, honouring that plan's pricing
     * type: fixed plans use their own rate, custom plans use the amount given.
     */
    public function onPlan(Plan $plan, float|int|string|null $negotiated = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'plan_id' => $plan->id,
            'monthly_price' => $plan->rateFor($negotiated),
        ]);
    }

    /**
     * Apply a trial length, deriving the trial end and renewal dates from it
     * exactly as the controller does.
     */
    public function trialDays(int $days): static
    {
        return $this->state(
            fn (array $attributes): array => Subscription::scheduleFromTrialDays($days),
        );
    }

    /**
     * Set the renewal date directly, used to exercise the renewal-window
     * filters without going through a trial calculation.
     */
    public function renewingOn(string $date): static
    {
        return $this->state(fn (array $attributes): array => [
            'renews_at' => $date,
        ]);
    }
}
