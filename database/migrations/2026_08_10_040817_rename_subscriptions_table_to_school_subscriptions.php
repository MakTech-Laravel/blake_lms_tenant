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
        if (! Schema::hasTable('subscriptions')) {
            return;
        }

        if (Schema::hasTable('school_subscriptions')) {
            return;
        }

        // Cashier's subscriptions table carries a `type` column; the commercial
        // agreement table does not.
        if (Schema::hasColumn('subscriptions', 'type')) {
            return;
        }

        Schema::rename('subscriptions', 'school_subscriptions');

        Schema::table('school_subscriptions', function (Blueprint $table): void {
            if (! Schema::hasColumn('school_subscriptions', 'billing_interval')) {
                $table->string('billing_interval')->default('monthly')->after('canceled_at');
            }

            if (! Schema::hasColumn('school_subscriptions', 'stripe_price_id')) {
                $table->string('stripe_price_id')->nullable()->after('billing_interval');
            }

            if (! Schema::hasColumn('school_subscriptions', 'stripe_status')) {
                $table->string('stripe_status')->nullable()->after('stripe_price_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('school_subscriptions')) {
            return;
        }

        if (Schema::hasTable('subscriptions')) {
            return;
        }

        Schema::table('school_subscriptions', function (Blueprint $table): void {
            if (Schema::hasColumn('school_subscriptions', 'billing_interval')) {
                $table->dropColumn('billing_interval');
            }

            if (Schema::hasColumn('school_subscriptions', 'stripe_price_id')) {
                $table->dropColumn('stripe_price_id');
            }

            if (Schema::hasColumn('school_subscriptions', 'stripe_status')) {
                $table->dropColumn('stripe_status');
            }
        });

        Schema::rename('school_subscriptions', 'subscriptions');
    }
};
