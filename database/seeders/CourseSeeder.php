<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\School;
use Illuminate\Database\Seeder;

/**
 * A couple of realistic certification courses per demo school.
 */
class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $count = 0;

        foreach ($this->courses() as $schoolSlug => $courses) {
            $school = School::where('slug', $schoolSlug)->first();

            if ($school === null) {
                continue;
            }

            foreach ($courses as $course) {
                Course::updateOrCreate(
                    ['school_id' => $school->id, 'slug' => $course['slug']],
                    [
                        'title' => $course['title'],
                        'description' => $course['description'],
                        'duration_hours' => $course['duration_hours'],
                        'price' => $course['price'],
                        'is_published' => true,
                    ],
                );
                $count++;
            }
        }

        $this->command->info("Courses: {$count} seeded.");
    }

    /**
     * @return array<string, array<int, array{title: string, slug: string, description: string, duration_hours: int, price: float}>>
     */
    private function courses(): array
    {
        return [
            'riverside-teacher-institute' => [
                [
                    'title' => 'Early Childhood Education Certification',
                    'slug' => 'early-childhood-education-certification',
                    'description' => 'Foundational pedagogy and classroom practice for pre-K through grade 3 educators.',
                    'duration_hours' => 120,
                    'price' => 899.00,
                ],
                [
                    'title' => 'Special Education Endorsement',
                    'slug' => 'special-education-endorsement',
                    'description' => 'Inclusive teaching strategies and IEP development for diverse learners.',
                    'duration_hours' => 160,
                    'price' => 1149.00,
                ],
            ],
            'summit-education-academy' => [
                [
                    'title' => 'ESL Teaching Certificate',
                    'slug' => 'esl-teaching-certificate',
                    'description' => 'Methods for teaching English to speakers of other languages across grade levels.',
                    'duration_hours' => 100,
                    'price' => 749.00,
                ],
                [
                    'title' => 'Secondary Mathematics Certification',
                    'slug' => 'secondary-mathematics-certification',
                    'description' => 'Content and instructional design for middle and high school mathematics.',
                    'duration_hours' => 140,
                    'price' => 999.00,
                ],
            ],
        ];
    }
}
