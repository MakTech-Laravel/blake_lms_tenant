<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('avatar')->nullable();
            $table->string('password');

            // Which dashboard this account belongs to:
            //   platform → platform owner/staff (roles are global, school_id NULL)
            //   school   → school staff (roles are team-scoped to their school)
            //   teacher  → students/teachers (no roles; access via enrollments)
            $table->string('type')->default('teacher')->index();

            // Home school for `school` staff. NULL for platform staff and
            // teachers. The foreign key is added in create_schools_table since
            // this migration runs before the schools table exists.
            $table->foreignId('school_id')->nullable()->index();

            // Branch this staff member is pinned to. NULL means head-office
            // (school-wide) access: the user sees every branch of their school.
            // A non-null value restricts them to that branch's data only. The
            // foreign key is added in create_branches_table.
            $table->foreignId('branch_id')->nullable()->index();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
