<?php

namespace Database\Factories;

use App\Enums\UserType;
use App\Models\Branch;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'type' => UserType::TEACHER,
            'school_id' => null,
            'branch_id' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is platform staff (roles are global, no school).
     */
    public function platform(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => UserType::PLATFORM,
            'school_id' => null,
        ]);
    }

    /**
     * Indicate that the user is staff at the given school.
     */
    public function schoolStaff(School $school): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => UserType::SCHOOL,
            'school_id' => $school->id,
        ]);
    }

    /**
     * Indicate that the user is staff pinned to the given branch, seeing only
     * that branch's data. Implies school staff at the branch's school.
     */
    public function branchStaff(Branch $branch): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => UserType::SCHOOL,
            'school_id' => $branch->school_id,
            'branch_id' => $branch->id,
        ]);
    }

    /**
     * Indicate that the user is a teacher/student.
     */
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => UserType::TEACHER,
            'school_id' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
