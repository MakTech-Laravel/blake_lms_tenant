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
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // The `school_id` column was added to `users` in the create_users_table
        // migration (which runs first). Wire up the foreign key now that the
        // schools table exists. Deleting a school detaches its staff.
        //
        // SQLite (used by the in-memory test database) cannot add a foreign key
        // to an existing table via ALTER TABLE, so we only add the constraint on
        // drivers that support it. The `school_id` column itself already exists
        // on every driver; only the DB-level constraint is skipped under SQLite.
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('school_id')
                    ->references('id')
                    ->on('schools')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['school_id']);
            });
        }

        Schema::dropIfExists('schools');
    }
};
