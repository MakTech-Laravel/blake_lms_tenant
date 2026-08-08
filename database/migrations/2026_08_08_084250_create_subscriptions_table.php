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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();

            // The agreed rate. Copied from the plan for fixed-price plans and
            // entered per organization for custom-priced ones.
            $table->decimal('monthly_price', 10, 2)->default(0);

            // Trial length in days, seeded from the plan's default. This is the
            // authored value; `trial_ends_at` below is derived from it.
            // Capped at Stripe's 730-day trial_period_days maximum.
            $table->unsignedSmallInteger('trial_days')->default(0);

            // Derived from `trial_days` on save today; Stripe becomes the source
            // of truth for both once billing is wired up.
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('renews_at')->nullable()->index();

            $table->timestamp('canceled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
