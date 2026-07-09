<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the project-specific metadata columns to the Spatie `permissions` table:
 *   - `group`  : display grouping for the role-management UI (e.g. "Courses").
 *   - `domain` : which dashboard the permission belongs to ("platform"/"school").
 *                Used to keep the two permission sets fully isolated.
 *
 * Run AFTER the Spatie migration:
 *   php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        $table = config('permission.table_names.permissions', 'permissions');

        Schema::table($table, function (Blueprint $table) {
            $table->string('group')->nullable()->after('guard_name');
            $table->string('domain')->nullable()->after('group')->index();
        });
    }

    public function down(): void
    {
        $table = config('permission.table_names.permissions', 'permissions');

        Schema::table($table, function (Blueprint $table) {
            $table->dropColumn(['group', 'domain']);
        });
    }
};
