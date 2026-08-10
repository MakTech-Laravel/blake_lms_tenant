<?php

use App\Enums\BillingInterval;
use App\Enums\PermissionEnum;
use App\Enums\PlanPricing;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;

beforeEach(function () {
    $this->withoutVite();
});

test('platform staff can open subscription tracking with stripe action urls', function () {
    $school = School::factory()->create();
    $plan = Plan::factory()->create();
    Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
        'billing_interval' => BillingInterval::Monthly,
        'stripe_status' => 'active',
    ]);

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('platform/subscriptions/index')
            ->has('tracking.data', 1)
            ->where('tracking.data.0.checkout_url', fn ($url) => str_contains($url, '/checkout'))
            ->where('tracking.data.0.cancel_url', fn ($url) => str_contains($url, '/cancel'))
        );
});

test('platform refund requires a payment intent', function () {
    $school = School::factory()->create(['stripe_id' => 'cus_refund']);
    $plan = Plan::factory()->create();
    $subscription = Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
    ]);

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.subscriptions.refund', $subscription), [])
        ->assertSessionHasErrors('payment_intent');
});

test('platform users without edit cannot checkout', function () {
    $school = School::factory()->create();
    $plan = Plan::factory()->create([
        'pricing_type' => PlanPricing::Fixed,
        'stripe_monthly_price_id' => 'price_x',
    ]);
    $subscription = Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
    ]);

    $user = platformUserWithPermissions([
        PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX,
    ]);

    $this->actingAs($user)
        ->post(route('platform.subscriptions.checkout', $subscription))
        ->assertForbidden();
});
