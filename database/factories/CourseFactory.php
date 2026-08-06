<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->unique()->bs());

        return [
            'school_id' => School::factory(),
            // School-wide by default; use forBranch() to pin a course.
            'branch_id' => null,
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->paragraph(),
            'duration_hours' => fake()->numberBetween(8, 120),
            'price' => fake()->randomFloat(2, 0, 999),
            'is_published' => true,
        ];
    }

    /**
     * Indicate that the course belongs to the given branch, and to that
     * branch's school.
     */
    public function forBranch(Branch $branch): static
    {
        return $this->state(fn (array $attributes): array => [
            'school_id' => $branch->school_id,
            'branch_id' => $branch->id,
        ]);
    }

    /**
     * Indicate that the course is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_published' => false,
        ]);
    }
}
