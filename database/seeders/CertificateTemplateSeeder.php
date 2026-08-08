<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        CertificateTemplate::query()->updateOrCreate(
            ['slug' => 'aquacert-standard'],
            [
                'name' => 'AquaCert Standard',
                'blade_view' => 'certificates.templates.default',
                'is_default' => true,
                'is_active' => true,
            ],
        );

        CertificateTemplate::query()->updateOrCreate(
            ['slug' => 'aquacert-compact'],
            [
                'name' => 'AquaCert Compact',
                'blade_view' => 'certificates.templates.default',
                'is_default' => false,
                'is_active' => true,
            ],
        );

        $this->command?->info('Certificate templates: 2 seeded.');
    }
}
