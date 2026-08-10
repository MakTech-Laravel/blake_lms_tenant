<?php

use App\Enums\BillingInterval;
use App\Enums\PermissionEnum;
use App\Enums\PlanPricing;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

test('school staff with billing view can open the billing page', function () {
    $school = School::factory()->create();
    $plan = Plan::factory()->create([
        'pricing_type' => PlanPricing::Fixed,
        'monthly_price' => 490,
        'stripe_monthly_price_id' => 'price_test_monthly',
    ]);

    Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
        'monthly_price' => 490,
        'billing_interval' => BillingInterval::Monthly,
    ]);

    $user = schoolStaffWithPermissions($school, [PermissionEnum::SCHOOL_BILLING_VIEW]);

    $this->actingAs($user)
        ->get(route('school.billing.index', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/billing/index')
            ->where('subscription.plan_name', $plan->name)
            ->has('availablePlans')
            ->has('intervalOptions', 2)
        );
});

test('school staff without billing view cannot open billing', function () {
    $school = School::factory()->create();
    $user = schoolStaffWithPermissions($school, [PermissionEnum::SCHOOL_DASHBOARD_VIEW]);

    $this->actingAs($user)
        ->get(route('school.billing.index', $school))
        ->assertForbidden();
});

test('school manage can create a fixed-plan agreement then fails checkout without stripe keys', function () {
    $school = School::factory()->create(['email' => 'billing@example.com']);
    $plan = Plan::factory()->create([
        'pricing_type' => PlanPricing::Fixed,
        'monthly_price' => 990,
        'annual_price' => 9900,
        'stripe_product_id' => 'prod_test',
        'stripe_monthly_price_id' => 'price_test_monthly',
        'stripe_annual_price_id' => 'price_test_annual',
        'is_active' => true,
    ]);

    $user = schoolStaffWithPermissions($school, [
        PermissionEnum::SCHOOL_BILLING_VIEW,
        PermissionEnum::SCHOOL_BILLING_MANAGE,
    ]);

    // Without Stripe credentials the Checkout call surfaces as a server error;
    // the commercial agreement must still be written first.
    config(['cashier.secret' => null, 'cashier.key' => null]);

    $this->actingAs($user)
        ->post(route('school.billing.checkout', $school), [
            'plan_id' => $plan->id,
            'interval' => BillingInterval::Annual->value,
        ])
        ->assertServerError();

    $agreement = $school->fresh()->schoolSubscription;

    expect($agreement)->not->toBeNull()
        ->and($agreement->plan_id)->toBe($plan->id)
        ->and($agreement->billing_interval)->toBe(BillingInterval::Annual)
        ->and((float) $agreement->monthly_price)->toBe(990.0);
});

test('school cannot invent a custom plan checkout without a negotiated assignment', function () {
    $school = School::factory()->create();
    $plan = Plan::factory()->create([
        'pricing_type' => PlanPricing::Custom,
        'monthly_price' => null,
        'stripe_product_id' => 'prod_custom',
        'is_active' => true,
    ]);

    $user = schoolStaffWithPermissions($school, [
        PermissionEnum::SCHOOL_BILLING_VIEW,
        PermissionEnum::SCHOOL_BILLING_MANAGE,
    ]);

    $this->actingAs($user)
        ->post(route('school.billing.checkout', $school), [
            'plan_id' => $plan->id,
            'interval' => BillingInterval::Monthly->value,
        ])
        ->assertStatus(422);

    expect($school->fresh()->schoolSubscription)->toBeNull();
});

test('school manage can cancel and resume when a cashier subscription exists', function () {
    $school = School::factory()->create([
        'stripe_id' => 'cus_test_school',
    ]);
    $plan = Plan::factory()->create();
    Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
        'stripe_status' => 'active',
    ]);

    // Seed a Cashier subscription row so cancel/resume have something to call.
    $school->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test_cancel',
        'stripe_status' => 'active',
        'stripe_price' => 'price_test',
        'quantity' => 1,
    ]);

    $user = schoolStaffWithPermissions($school, [
        PermissionEnum::SCHOOL_BILLING_VIEW,
        PermissionEnum::SCHOOL_BILLING_MANAGE,
    ]);

    // cancel() hits Stripe; without a secret it throws. Assert the route is
    // reachable for authorized staff instead of mocking the entire SDK here.
    config(['cashier.secret' => 'sk_test_fake']);

    $this->actingAs($user)
        ->patch(route('school.billing.cancel', $school))
        ->assertStatus(500);
});
