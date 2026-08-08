<?php

namespace Database\Factories;

use App\Enums\SchoolStatus;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<School>
 */
class SchoolFactory extends Factory
{
    /**
     * Regions shown under the organization name in the Organizations list.
     *
     * @var array<int, string>
     */
    public const REGIONS = [
        'North America',
        'Europe',
        'Asia Pacific',
        'Middle East',
        'Oceania',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->company().' Academy';

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'region' => fake()->randomElement(self::REGIONS),
            'status' => SchoolStatus::Active,
        ];
    }

    /**
     * Indicate that the organization is on a trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SchoolStatus::Trial,
        ]);
    }

    /**
     * Indicate that the organization is suspended and locked out of its
     * dashboard.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SchoolStatus::Suspended,
        ]);
    }

    /**
     * Pin the organization to a specific region.
     */
    public function region(string $region): static
    {
        return $this->state(fn (array $attributes): array => [
            'region' => $region,
        ]);
    }
}
