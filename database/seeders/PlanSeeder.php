<?php

namespace Database\Seeders;

use App\Enums\PlanPricing;
use App\Models\Plan;
use Illuminate\Database\Seeder;

/**
 * The three subscription tiers offered to organizations.
 *
 * The two packaged tiers are fixed-price: every organization on them pays the
 * listed rate and it cannot be overridden. Enterprise is quoted per deal, so it
 * carries no list price and the rate is entered when it is assigned.
 *
 * A NULL limit means unlimited, which is how the Enterprise card renders.
 */
class PlanSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->plans() as $index => $plan) {
            Plan::withTrashed()->updateOrCreate(
                ['slug' => $plan['slug']],
                [
                    ...$plan,
                    'sort_order' => $index,
                    'is_active' => true,
                    'deleted_at' => null,
                ],
            );
        }

        $this->command->info('Plans: '.count($this->plans()).' seeded.');
    }

    /**
     * @return array<int, array{
     *     name: string,
     *     slug: string,
     *     pricing_type: PlanPricing,
     *     monthly_price: float|null,
     *     annual_price: float|null,
     *     description: string,
     *     staff_limit: int|null,
     *     location_limit: int|null,
     *     course_limit: int|null,
     *     storage_gb: int|null,
     *     features: array<int, string>,
     *     is_popular: bool,
     *     trial_days: int
     * }>
     */
    private function plans(): array
    {
        return [
            [
                'name' => 'LMS Only',
                'slug' => 'lms-only',
                'pricing_type' => PlanPricing::Fixed,
                'monthly_price' => 490.00,
                'annual_price' => 4900.00,
                'description' => 'For single-location swim schools getting started with digital training.',
                'staff_limit' => 25,
                'location_limit' => 1,
                'course_limit' => 10,
                'storage_gb' => 50,
                'features' => [
                    'Core LMS and course delivery',
                    'Up to 25 staff accounts',
                    '10 active courses',
                    '5 learning pathways',
                    'Basic certificates',
                    'Standard reporting',
                    'Email support',
                    'Mobile access',
                ],
                'is_popular' => false,
                'trial_days' => 14,
            ],
            [
                'name' => 'LMS + Training Content',
                'slug' => 'lms-training-content',
                'pricing_type' => PlanPricing::Fixed,
                'monthly_price' => 990.00,
                'annual_price' => 9900.00,
                'description' => 'For growing swim schools that need the AquaCert content library and multi-location tools.',
                'staff_limit' => 100,
                'location_limit' => 5,
                'course_limit' => null,
                'storage_gb' => 250,
                'features' => [
                    'Everything in LMS Only',
                    'Full AquaCert content library',
                    'Up to 100 staff accounts',
                    'Unlimited courses and pathways',
                    'Custom branded certificates',
                    'Advanced analytics and heatmaps',
                    'Bulk assignment and reminders',
                    'Compliance dashboards',
                    'Assessment builder',
                    'API access',
                    'Priority email and chat support',
                ],
                'is_popular' => true,
                'trial_days' => 14,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'pricing_type' => PlanPricing::Custom,
                'monthly_price' => null,
                'annual_price' => null,
                'description' => 'For large organizations and franchises needing full white-label customization.',
                'staff_limit' => null,
                'location_limit' => null,
                'course_limit' => null,
                'storage_gb' => null,
                'features' => [
                    'Unlimited staff, locations, and courses',
                    'White-label platform',
                    'Dedicated account manager',
                    'Custom learning pathways',
                    'Custom integrations (SSO, HRIS, SCORM)',
                    'On-premise deployment option',
                    'SLA guarantees',
                    'Custom training and onboarding',
                    'Data migration assistance',
                    'Quarterly business reviews',
                    '24/7 phone and chat support',
                ],
                'is_popular' => false,
                'trial_days' => 30,
            ],
        ];
    }
}
