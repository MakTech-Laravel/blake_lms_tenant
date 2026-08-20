<?php

use App\Enums\BillingInterval;
use App\Enums\PlanPricing;
use App\Enums\SchoolStatus;
use App\Listeners\StripeEventListener;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Support\Billing\StripePlanSync;
use App\Support\Billing\SyncSchoolSubscriptionFromStripe;
use Laravel\Cashier\Events\WebhookHandled;

test('stripe plan sync is a no-op without a stripe secret', function () {
    config(['cashier.secret' => null]);

    $plan = Plan::factory()->create([
        'pricing_type' => PlanPricing::Fixed,
        'monthly_price' => 100,
        'stripe_product_id' => null,
    ]);

    app(StripePlanSync::class)->sync($plan);

    expect($plan->fresh()->stripe_product_id)->toBeNull();
});

test('webhook sync is a no-op when the school cannot be resolved', function () {
    $school = School::factory()->create([
        'stripe_id' => 'cus_known',
        'status' => SchoolStatus::Trial,
    ]);
    $plan = Plan::factory()->create();
    Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
        'stripe_status' => null,
    ]);

    app(SyncSchoolSubscriptionFromStripe::class)->syncFromPayload([
        'type' => 'customer.subscription.updated',
        'data' => [
            'object' => [
                'customer' => 'cus_unknown',
                'metadata' => [],
            ],
        ],
    ]);

    expect($school->fresh()->schoolSubscription->stripe_status)->toBeNull()
        ->and($school->fresh()->status)->toBe(SchoolStatus::Trial);
});

test('webhook sync finds the school from metadata without calling stripe', function () {
    $school = School::factory()->create(['stripe_id' => 'cus_meta']);
    $plan = Plan::factory()->create();
    Subscription::factory()->create([
        'school_id' => $school->id,
        'plan_id' => $plan->id,
    ]);

    // No Cashier subscription row, so sync returns after resolving the school
    // without writing Stripe-derived fields.
    app(SyncSchoolSubscriptionFromStripe::class)->syncFromPayload([
        'type' => 'checkout.session.completed',
        'data' => [
            'object' => [
                'customer' => 'cus_meta',
                'metadata' => ['school_id' => (string) $school->id],
            ],
        ],
    ]);

    expect($school->fresh()->schoolSubscription)->not->toBeNull();
});

test('stripe event listener ignores unrelated webhook types', function () {
    $sync = Mockery::mock(SyncSchoolSubscriptionFromStripe::class);
    $sync->shouldNotReceive('syncFromPayload');

    $listener = new StripeEventListener($sync);
    $listener->handle(new WebhookHandled([
        'type' => 'charge.succeeded',
        'data' => ['object' => []],
    ]));
});

test('stripe event listener forwards handled subscription events', function () {
    $sync = Mockery::mock(SyncSchoolSubscriptionFromStripe::class);
    $sync->shouldReceive('syncFromPayload')->once();

    $listener = new StripeEventListener($sync);
    $listener->handle(new WebhookHandled([
        'type' => 'customer.subscription.updated',
        'data' => ['object' => ['customer' => 'cus_x']],
    ]));
});

test('billing interval maps to stripe recurring values', function () {
    expect(BillingInterval::Monthly->stripeInterval())->toBe('month')
        ->and(BillingInterval::Annual->stripeInterval())->toBe('year')
        ->and(BillingInterval::options())->toHaveCount(2);
});
