<?php

namespace Database\Factories;

use App\Enums\PlanPricing;
use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true).' Plan';

        $monthly = fake()->randomElement([290, 590, 990, 1490]);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'pricing_type' => PlanPricing::Fixed,
            'monthly_price' => $monthly,
            // Ten months for the price of twelve, the usual annual discount.
            'annual_price' => $monthly * 10,
            'description' => fake()->sentence(),
            'staff_limit' => fake()->randomElement([25, 100, 250]),
            'location_limit' => fake()->randomElement([1, 5, 10]),
            'course_limit' => fake()->randomElement([10, 50, 100]),
            'storage_gb' => fake()->randomElement([50, 250, 1024]),
            'features' => [
                'Core LMS',
                'Basic reports',
                'Email support',
            ],
            'is_popular' => false,
            'trial_days' => 14,
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }

    /**
     * A plan quoted per deal: no list price, so the rate is entered when the
     * plan is assigned to an organization.
     */
    public function customPriced(): static
    {
        return $this->state(fn (array $attributes): array => [
            'pricing_type' => PlanPricing::Custom,
            'monthly_price' => null,
            'annual_price' => null,
        ]);
    }

    /**
     * The plan wearing the "most popular" ribbon.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_popular' => true,
        ]);
    }

    /**
     * A plan with no caps, which is how the Enterprise tier renders.
     */
    public function unlimited(): static
    {
        return $this->state(fn (array $attributes): array => [
            'staff_limit' => null,
            'location_limit' => null,
            'course_limit' => null,
            'storage_gb' => null,
        ]);
    }

    /**
     * @param  array<int, string>  $features
     */
    public function withFeatures(array $features): static
    {
        return $this->state(fn (array $attributes): array => [
            'features' => $features,
        ]);
    }

    /**
     * A plan at a fixed rate that cannot be overridden per organization.
     */
    public function fixedPrice(float $price): static
    {
        return $this->state(fn (array $attributes): array => [
            'pricing_type' => PlanPricing::Fixed,
            'monthly_price' => $price,
            'annual_price' => $price * 10,
        ]);
    }

    /**
     * Set the plan's default trial length in days.
     */
    public function trialDays(int $days): static
    {
        return $this->state(fn (array $attributes): array => [
            'trial_days' => $days,
        ]);
    }

    /**
     * Indicate that the plan can no longer be assigned.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
