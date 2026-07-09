<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

/**
 * Two demo teachers with realistic enrollments and a couple of issued
 * certificates. Teachers hold no roles — access derives from enrollments.
 */
class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        // Teachers hold no roles; keep the global (NULL) team active.
        app(PermissionRegistrar::class)->setPermissionsTeamId(null);

        $daniel = $this->teacher('Daniel Okafor', 'teacher1@dev.com');
        $sofia = $this->teacher('Sofia Marchetti', 'teacher2@dev.com');

        $this->enroll($daniel, 'early-childhood-education-certification', 'completed', 100, issueCertificate: true);
        $this->enroll($daniel, 'special-education-endorsement', 'in_progress', 45);

        $this->enroll($sofia, 'esl-teaching-certificate', 'completed', 100, issueCertificate: true);
        $this->enroll($sofia, 'secondary-mathematics-certification', 'enrolled', 10);

        $this->command->info('Teachers: 2 seeded with enrollments and certificates.');
    }

    private function teacher(string $name, string $email): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($email),
                'email_verified_at' => now(),
                'type' => UserType::TEACHER,
                'school_id' => null,
            ],
        );
    }

    private function enroll(
        User $teacher,
        string $courseSlug,
        string $status,
        int $progress,
        bool $issueCertificate = false,
    ): void {
        $course = Course::where('slug', $courseSlug)->first();

        if ($course === null) {
            return;
        }

        $enrollment = CourseEnrollment::updateOrCreate(
            ['user_id' => $teacher->id, 'course_id' => $course->id],
            [
                'status' => $status,
                'progress' => $progress,
                'enrolled_at' => now()->subMonths(3),
                'completed_at' => $status === 'completed' ? now()->subWeeks(2) : null,
            ],
        );

        if ($issueCertificate) {
            Certificate::updateOrCreate(
                ['course_enrollment_id' => $enrollment->id],
                [
                    'user_id' => $teacher->id,
                    'course_id' => $course->id,
                    'certificate_number' => 'CERT-'.now()->year.'-'.str_pad((string) $enrollment->id, 5, '0', STR_PAD_LEFT),
                    'issued_at' => now()->subWeeks(2),
                ],
            );
        }
    }
}
