<?php

namespace Database\Factories;

use App\Enums\UserType;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseEnrollment>
 */
class CourseEnrollmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'user_id' => User::factory()->state(['type' => UserType::TEACHER]),
            'status' => 'enrolled',
            'progress' => fake()->numberBetween(0, 100),
            'enrolled_at' => now(),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the enrollment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'completed',
            'progress' => 100,
            'completed_at' => now(),
        ]);
    }
}
