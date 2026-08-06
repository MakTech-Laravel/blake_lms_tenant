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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')
                ->constrained('schools')
                ->cascadeOnDelete();

            // Branch offering this course. NULL means school-wide, which only
            // head-office users can see. The foreign key is added in
            // create_branches_table, which runs after this migration.
            $table->foreignId('branch_id')->nullable()->index();

            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('duration_hours')->nullable();
            $table->decimal('price', 8, 2)->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            // Slugs are unique within a school, not globally.
            $table->unique(['school_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
