<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\CourseEnrollment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Certificates denormalise user_id and course_id from the enrollment, so
        // build the enrollment first and keep the three foreign keys consistent.
        $enrollment = CourseEnrollment::factory()->completed()->create();

        return [
            'course_enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_number' => 'CERT-'.Str::upper(fake()->unique()->bothify('????-#####')),
            'issued_at' => now(),
            'expires_at' => now()->addYears(2),
            'status' => 'valid',
        ];
    }

    /**
     * Issue the certificate for an existing enrollment, keeping the denormalised
     * user_id and course_id in sync.
     */
    public function forEnrollment(CourseEnrollment $enrollment): static
    {
        return $this->state(fn (array $attributes): array => [
            'course_enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
        ]);
    }
}
