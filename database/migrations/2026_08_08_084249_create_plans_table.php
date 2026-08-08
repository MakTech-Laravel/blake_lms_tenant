<?php

use App\Enums\PlanPricing;
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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();

            $table->string('pricing_type')->default(PlanPricing::Fixed->value)->index();

            // NULL for custom-priced plans: the rate is quoted per organization
            // and lives on the subscription instead.
            $table->decimal('monthly_price', 10, 2)->nullable();
            $table->decimal('annual_price', 10, 2)->nullable();

            $table->string('description')->nullable();

            // NULL on any limit means unlimited, which is how Enterprise renders.
            // Stored and displayed on the plan cards; not enforced yet.
            $table->unsignedInteger('staff_limit')->nullable();
            $table->unsignedInteger('location_limit')->nullable();
            $table->unsignedInteger('course_limit')->nullable();
            $table->unsignedInteger('storage_gb')->nullable();

            // The bullet list shown on the plan card, in authored order.
            $table->json('features');

            // At most one plan wears the "most popular" ribbon.
            $table->boolean('is_popular')->default(false);

            // Default free-trial length applied when this plan is assigned.
            // Capped at Stripe's 730-day (2 year) trial_period_days maximum.
            $table->unsignedSmallInteger('trial_days')->default(0);

            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Retiring a plan must not orphan the subscriptions priced against
            // it, so plans are archived rather than removed.
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
