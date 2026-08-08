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
            SchoolSeeder::class,    // schools + team-scoped roles + school staff
            BranchSeeder::class,    // branches + branch-pinned managers
            CourseSeeder::class,    // courses per school, pinned to branches
            CertificateTemplateSeeder::class,
            TeacherSeeder::class,   // teachers + enrollments + certificates
        ]);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
