<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Course;
use App\Models\School;
use Illuminate\Database\Seeder;

/**
 * A couple of realistic certification courses per demo school.
 *
 * Each course is pinned to a branch, except the deliberately school-wide one
 * (`branch` => null) that only head-office staff can see — that row is what
 * makes the "NULL means school-wide" half of the design observable in the demo
 * data rather than only in tests.
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

            /** @var array<string, int> $branchIds */
            $branchIds = Branch::where('school_id', $school->id)
                ->pluck('id', 'slug')
                ->all();

            foreach ($courses as $course) {
                Course::updateOrCreate(
                    ['school_id' => $school->id, 'slug' => $course['slug']],
                    [
                        'branch_id' => $course['branch'] === null
                            ? null
                            : ($branchIds[$course['branch']] ?? null),
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
     * @return array<string, array<int, array{title: string, slug: string, description: string, duration_hours: int, price: float, branch: string|null}>>
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
                    'branch' => 'rangpur',
                ],
                [
                    'title' => 'Special Education Endorsement',
                    'slug' => 'special-education-endorsement',
                    'description' => 'Inclusive teaching strategies and IEP development for diverse learners.',
                    'duration_hours' => 160,
                    'price' => 1149.00,
                    'branch' => 'khulna',
                ],
                [
                    'title' => 'Classroom Technology Essentials',
                    'slug' => 'classroom-technology-essentials',
                    'description' => 'Practical instructional technology for everyday classroom use.',
                    'duration_hours' => 60,
                    'price' => 449.00,
                    'branch' => 'barishal',
                ],
                [
                    'title' => 'Institute-Wide Teacher Wellbeing Programme',
                    'slug' => 'institute-wide-teacher-wellbeing-programme',
                    'description' => 'Run centrally for every branch, so it belongs to no single one.',
                    'duration_hours' => 20,
                    'price' => 0.00,
                    'branch' => null,
                ],
            ],
            'summit-education-academy' => [
                [
                    'title' => 'ESL Teaching Certificate',
                    'slug' => 'esl-teaching-certificate',
                    'description' => 'Methods for teaching English to speakers of other languages across grade levels.',
                    'duration_hours' => 100,
                    'price' => 749.00,
                    'branch' => 'main-campus',
                ],
                [
                    'title' => 'Secondary Mathematics Certification',
                    'slug' => 'secondary-mathematics-certification',
                    'description' => 'Content and instructional design for middle and high school mathematics.',
                    'duration_hours' => 140,
                    'price' => 999.00,
                    'branch' => 'main-campus',
                ],
            ],
        ];
    }
}
