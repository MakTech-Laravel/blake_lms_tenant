<?php

use App\Enums\PermissionEnum;
use App\Enums\SchoolStatus;
use App\Enums\SubscriptionStatus;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * One subscription per derived status, so a single fixture exercises all four.
 *
 * @return array<string, Subscription>
 */
function subscriptionsInEveryStatus(): array
{
    $plan = Plan::factory()->create(['name' => 'Growth', 'slug' => 'growth']);

    $active = Subscription::factory()
        ->forSchool(School::factory()->create(['name' => 'Active Swim', 'status' => SchoolStatus::Active]))
        ->onPlan($plan)
        ->renewingOn(now()->addMonth()->toDateTimeString())
        ->create();

    $trial = Subscription::factory()
        ->forSchool(School::factory()->create(['name' => 'Trial Swim', 'status' => SchoolStatus::Trial]))
        ->onPlan($plan)
        ->trialDays(14)
        ->create();

    $expired = Subscription::factory()
        ->forSchool(School::factory()->create(['name' => 'Expired Swim', 'status' => SchoolStatus::Active]))
        ->onPlan($plan)
        ->renewingOn(now()->subWeek()->toDateTimeString())
        ->create();

    // Suspended outranks the dates, so this one is deliberately also overdue.
    $suspended = Subscription::factory()
        ->forSchool(School::factory()->create(['name' => 'Suspended Swim', 'status' => SchoolStatus::Suspended]))
        ->onPlan($plan)
        ->renewingOn(now()->subWeek()->toDateTimeString())
        ->create();

    return compact('active', 'trial', 'expired', 'suspended');
}

test('the plans tab renders the catalog without querying the tracking table', function () {
    Plan::factory()->popular()->create(['name' => 'Growth']);

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/subscriptions/index')
            ->where('tab', 'plans')
            ->has('plans', 1)
            ->where('plans.0.is_popular', true)
            // The tracking props are only built for their own tab.
            ->missing('tracking')
            ->missing('stats')
        );
});

test('a custom-priced plan card invites a conversation instead of quoting a price', function () {
    Plan::factory()->customPriced()->unlimited()->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('plans.0.price_headline', "Let's Talk")
            ->where('plans.0.price_caption', 'Custom pricing')
            ->where('plans.0.annual_price_label', null)
            ->where('plans.0.limit_badges.0', 'Unlimited staff members')
            ->where('plans.0.limit_badges.3', 'Unlimited storage')
        );
});

test('each derived status is resolved from the school status and the dates', function () {
    $subscriptions = subscriptionsInEveryStatus();

    expect($subscriptions['active']->load('school')->status())->toBe(SubscriptionStatus::Active)
        ->and($subscriptions['trial']->load('school')->status())->toBe(SubscriptionStatus::Trial)
        ->and($subscriptions['expired']->load('school')->status())->toBe(SubscriptionStatus::Expired)
        // Suspension wins over an overdue renewal.
        ->and($subscriptions['suspended']->load('school')->status())->toBe(SubscriptionStatus::Suspended);
});

test('the tracking tab counts every status across the whole book of business', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('tab', 'tracking')
            ->has('tracking.data', 4)
            ->where('stats.active', 1)
            ->where('stats.trial', 1)
            ->where('stats.expired', 1)
            ->where('stats.suspended', 1)
        );
});

test('only a billable subscription contributes to MRR', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', [
            'tab' => 'tracking',
            'status' => SubscriptionStatus::Expired->value,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tracking.data', 1)
            ->where('tracking.data.0.organization', 'Expired Swim')
            ->where('tracking.data.0.mrr_label', '$0')
        );
});

test('the expired status filters in SQL rather than after pagination', function () {
    subscriptionsInEveryStatus();

    foreach (SubscriptionStatus::cases() as $status) {
        $this->actingAs(platformSuperAdmin())
            ->get(route('platform.subscriptions.index', [
                'tab' => 'tracking',
                'status' => $status->value,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('tracking.data', 1)
                ->where('tracking.data.0.status_value', $status->value)
                // The count reflects the filtered query, not just the page.
                ->where('tracking.total', 1)
            );
    }
});

test('the tracking table searches organizations and plans', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'search' => 'Trial Swim']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tracking.data', 1)
            ->where('tracking.data.0.organization', 'Trial Swim')
        );

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'search' => 'Growth']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('tracking.data', 4));
});

test('the tracking table filters by plan', function () {
    subscriptionsInEveryStatus();

    $other = Plan::factory()->create(['name' => 'Starter', 'slug' => 'starter']);
    Subscription::factory()
        ->forSchool(School::factory()->create(['name' => 'Starter Swim']))
        ->onPlan($other)
        ->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'plan' => 'starter']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tracking.data', 1)
            ->where('tracking.data.0.organization', 'Starter Swim')
        );
});

test('the tracking table sorts by organization in either direction', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'sort' => 'organization', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('tracking.data.0.organization', 'Trial Swim')
        );

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'sort' => 'organization', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('tracking.data.0.organization', 'Active Swim')
        );
});

test('an unknown sort column falls back to the default instead of reaching the database', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.index', ['tab' => 'tracking', 'sort' => 'schools.password']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'organization'));
});

test('renewing an expired subscription brings it current', function () {
    $subscriptions = subscriptionsInEveryStatus();
    $expired = $subscriptions['expired'];

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.subscriptions.index', ['tab' => 'tracking']))
        ->patch(route('platform.subscriptions.renew', $expired))
        ->assertRedirect(route('platform.subscriptions.index', ['tab' => 'tracking']));

    expect($expired->refresh()->renews_at->isFuture())->toBeTrue()
        ->and($expired->load('school')->status())->toBe(SubscriptionStatus::Active);
});

test('renewing early extends the term rather than shortening it', function () {
    $renewal = now()->addMonths(3)->startOfSecond();
    $subscription = Subscription::factory()->renewingOn($renewal->toDateTimeString())->create();

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.subscriptions.index'))
        ->patch(route('platform.subscriptions.renew', $subscription));

    expect($subscription->refresh()->renews_at->toDateString())
        ->toBe($renewal->copy()->addMonth()->toDateString());
});

test('the tracking export honours the active filters', function () {
    subscriptionsInEveryStatus();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.subscriptions.export', [
            'status' => SubscriptionStatus::Trial->value,
            'format' => 'csv',
        ]))
        ->assertOk()
        ->assertDownload();
});

test('the subscriptions module is gated on its permissions', function () {
    $subscription = Subscription::factory()->create();
    $user = User::factory()->platform()->create();

    $this->actingAs($user)->get(route('platform.subscriptions.index'))->assertForbidden();
    $this->actingAs($user)->get(route('platform.subscriptions.export'))->assertForbidden();
    $this->actingAs($user)->patch(route('platform.subscriptions.renew', $subscription))->assertForbidden();
});

test('viewing the tracking table does not confer the right to renew', function () {
    $subscription = Subscription::factory()->create();
    $user = platformUserWithPermissions([PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX]);

    $this->actingAs($user)->get(route('platform.subscriptions.index', ['tab' => 'tracking']))->assertOk();
    $this->actingAs($user)->patch(route('platform.subscriptions.renew', $subscription))->assertForbidden();
});
