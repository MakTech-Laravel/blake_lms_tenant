<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,      // global platform roles
            UserSeeder::class,      // platform staff
            PlanSeeder::class,      // subscription tiers, needed by SchoolSeeder
            SchoolSeeder::class,    // schools + subscriptions + team-scoped roles + school staff
            BranchSeeder::class,    // branches + branch-pinned managers
            CourseSeeder::class,    // courses per school, pinned to branches
            CertificateTemplateSeeder::class,
            TeacherSeeder::class,   // teachers + enrollments + certificates
            NotificationSeeder::class, // platform announcements, fanned out to the users above
        ]);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
