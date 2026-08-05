<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables carrying a `branch_id` whose foreign key must be wired up here.
     *
     * @var array<int, string>
     */
    private array $branchTables = ['users', 'courses'];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')
                ->constrained('schools')
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Slugs are unique within a school, not globally.
            $table->unique(['school_id', 'slug']);
        });

        // The `branch_id` columns were added to `users` and `courses` in their
        // own create migrations (which run first). Wire up the foreign keys now
        // that the branches table exists. Deleting a branch detaches its rows,
        // which returns staff to head-office (school-wide) access.
        //
        // SQLite (used by the in-memory test database) cannot add a foreign key
        // to an existing table via ALTER TABLE, so we only add the constraints
        // on drivers that support it. The `branch_id` columns themselves already
        // exist on every driver; only the DB-level constraint is skipped.
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            foreach ($this->branchTables as $name) {
                Schema::table($name, function (Blueprint $table) {
                    $table->foreign('branch_id')
                        ->references('id')
                        ->on('branches')
                        ->nullOnDelete();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            foreach ($this->branchTables as $name) {
                Schema::table($name, function (Blueprint $table) {
                    $table->dropForeign(['branch_id']);
                });
            }
        }

        Schema::dropIfExists('branches');
    }
};
