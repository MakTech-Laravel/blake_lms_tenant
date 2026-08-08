<?php

use App\Enums\PermissionEnum;
use App\Enums\PlanPricing;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;

/**
 * Valid create payload, overridable per test.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function planPayload(array $overrides = []): array
{
    return [
        'name' => 'Growth',
        'pricing_type' => PlanPricing::Fixed->value,
        'monthly_price' => '790.00',
        'annual_price' => '7900.00',
        'description' => 'For schools scaling past one location.',
        'staff_limit' => '50',
        'location_limit' => '3',
        'course_limit' => '',
        'storage_gb' => '100',
        'features' => "Core LMS\n\n  Custom certificates  \nPriority support",
        'is_popular' => false,
        'trial_days' => '14',
        'sort_order' => '1',
        'is_active' => true,
        ...$overrides,
    ];
}

test('a plan is created with its limits and features', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.store'), planPayload())
        ->assertRedirect(route('platform.subscriptions.index'));

    $plan = Plan::query()->where('slug', 'growth')->sole();

    expect($plan->pricing_type)->toBe(PlanPricing::Fixed)
        ->and((float) $plan->monthly_price)->toBe(790.00)
        ->and((float) $plan->annual_price)->toBe(7900.00)
        ->and($plan->staff_limit)->toBe(50)
        ->and($plan->location_limit)->toBe(3)
        // A blank limit means unlimited, stored as NULL rather than zero.
        ->and($plan->course_limit)->toBeNull()
        ->and($plan->storage_gb)->toBe(100)
        // Blank lines are dropped and each feature is trimmed.
        ->and($plan->features)->toBe(['Core LMS', 'Custom certificates', 'Priority support'])
        ->and($plan->trial_days)->toBe(14);
});

test('a fixed-price plan requires a monthly rate', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.store'), planPayload(['monthly_price' => '']))
        ->assertSessionHasErrors('monthly_price');

    expect(Plan::query()->where('slug', 'growth')->exists())->toBeFalse();
});

test('a custom-priced plan stores no rate even when one is submitted', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.store'), planPayload([
            'pricing_type' => PlanPricing::Custom->value,
            'monthly_price' => '5000.00',
            'annual_price' => '50000.00',
        ]))
        ->assertRedirect(route('platform.subscriptions.index'));

    $plan = Plan::query()->where('slug', 'growth')->sole();

    expect($plan->pricing_type)->toBe(PlanPricing::Custom)
        ->and($plan->monthly_price)->toBeNull()
        ->and($plan->annual_price)->toBeNull()
        ->and($plan->hasCustomPricing())->toBeTrue();
});

test('a trial cannot exceed the maximum Stripe supports', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.store'), planPayload([
            'trial_days' => (string) (Subscription::TRIAL_DAYS_MAX + 1),
        ]))
        ->assertSessionHasErrors('trial_days');
});

test('promoting a plan to most popular demotes the one that held it', function () {
    $held = Plan::factory()->popular()->create();
    $plan = Plan::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->put(route('platform.plans.update', $plan), planPayload([
            'name' => $plan->name,
            'slug' => $plan->slug,
            'is_popular' => true,
        ]))
        ->assertRedirect(route('platform.subscriptions.index'));

    expect($plan->refresh()->is_popular)->toBeTrue()
        ->and($held->refresh()->is_popular)->toBeFalse()
        ->and(Plan::query()->where('is_popular', true)->count())->toBe(1);
});

test('archiving a plan keeps the subscriptions priced against it', function () {
    $plan = Plan::factory()->create();
    $school = School::factory()->create();
    Subscription::factory()->for($school)->onPlan($plan)->create();

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.subscriptions.index'))
        ->delete(route('platform.plans.destroy', $plan))
        ->assertRedirect(route('platform.subscriptions.index'));

    expect($plan->refresh()->trashed())->toBeTrue()
        ->and($school->refresh()->subscription)->not->toBeNull()
        // The agreement still resolves its plan, archived or not.
        ->and($school->subscription->plan->id)->toBe($plan->id);
});

test('an archived plan can be restored to the catalog', function () {
    $plan = Plan::factory()->create();
    $plan->delete();

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.subscriptions.index'))
        ->patch(route('platform.plans.restore', $plan))
        ->assertRedirect(route('platform.subscriptions.index'));

    expect($plan->refresh()->trashed())->toBeFalse();
});

test('duplicating a plan produces an inactive copy that is never popular', function () {
    $plan = Plan::factory()->popular()->create(['slug' => 'growth', 'sort_order' => 2]);

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.duplicate', $plan));

    $copy = Plan::query()->where('slug', 'growth-copy')->sole();

    expect($copy->name)->toBe($plan->name.' (Copy)')
        ->and($copy->is_active)->toBeFalse()
        ->and($copy->is_popular)->toBeFalse()
        ->and($copy->sort_order)->toBe(3)
        ->and($copy->features)->toBe($plan->features)
        // The original keeps the ribbon.
        ->and($plan->refresh()->is_popular)->toBeTrue();
});

test('duplicating twice does not collide on the slug', function () {
    $plan = Plan::factory()->create(['slug' => 'growth']);

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.duplicate', $plan));
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.plans.duplicate', $plan));

    expect(Plan::query()->where('slug', 'growth-copy')->exists())->toBeTrue()
        ->and(Plan::query()->where('slug', 'growth-copy-2')->exists())->toBeTrue();
});

test('a platform user without the subscriptions permissions cannot reach the editor', function () {
    $plan = Plan::factory()->create();
    $user = User::factory()->platform()->create();

    $this->actingAs($user)->get(route('platform.plans.create'))->assertForbidden();
    $this->actingAs($user)->get(route('platform.plans.edit', $plan))->assertForbidden();
    $this->actingAs($user)->post(route('platform.plans.store'), planPayload())->assertForbidden();
    $this->actingAs($user)->delete(route('platform.plans.destroy', $plan))->assertForbidden();
});

test('the index permission alone does not allow editing the catalog', function () {
    $plan = Plan::factory()->create();
    $user = platformUserWithPermissions([PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX]);

    $this->actingAs($user)->get(route('platform.subscriptions.index'))->assertOk();
    $this->actingAs($user)->post(route('platform.plans.duplicate', $plan))->assertForbidden();
    $this->actingAs($user)->delete(route('platform.plans.destroy', $plan))->assertForbidden();
});
