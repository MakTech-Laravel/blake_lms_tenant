<?php

use App\Enums\SchoolStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the boolean `is_active` flag with the three-state account status
     * the Organizations UI needs, and add the region shown under each name.
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->string('region')->nullable()->index()->after('address');
            $table->string('status')->default(SchoolStatus::Active->value)->index()->after('region');
        });

        DB::table('schools')->update([
            'status' => DB::raw(
                'case when is_active = 1 then '.DB::getPdo()->quote(SchoolStatus::Active->value)
                .' else '.DB::getPdo()->quote(SchoolStatus::Suspended->value).' end'
            ),
        ]);

        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('address');
        });

        DB::table('schools')->update([
            'is_active' => DB::raw(
                'case when status = '.DB::getPdo()->quote(SchoolStatus::Suspended->value)
                .' then 0 else 1 end'
            ),
        ]);

        Schema::table('schools', function (Blueprint $table) {
            $table->dropColumn(['region', 'status']);
        });
    }
};
