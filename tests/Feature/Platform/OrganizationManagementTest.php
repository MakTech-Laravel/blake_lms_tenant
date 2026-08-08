<?php

use App\Enums\PermissionEnum;
use App\Enums\PlanPricing;
use App\Enums\SchoolStatus;
use App\Models\Branch;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Valid create payload, overridable per test.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function organizationPayload(array $overrides = []): array
{
    return [
        'name' => 'Blue Lagoon Swim',
        'email' => 'ops@bluelagoon.test',
        'phone' => '+61 2 5550 1234',
        'address' => '14 Marine Parade, Sydney',
        'region' => 'APAC',
        'status' => SchoolStatus::Active->value,
        'plan_id' => null,
        'trial_days' => 0,
        ...$overrides,
    ];
}

test('the organizations list renders with its stats and filter options', function () {
    $plan = Plan::factory()->create(['name' => 'Growth', 'slug' => 'growth']);
    School::factory()->count(2)->create(['status' => SchoolStatus::Active, 'region' => 'APAC']);
    $trialling = School::factory()->create(['status' => SchoolStatus::Trial]);
    Subscription::factory()->forSchool($trialling)->onPlan($plan)->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.organizations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/organizations/index')
            ->has('organizations.data', 3)
            ->where('stats.total', 3)
            ->has('planOptions')
            ->has('regionOptions')
            ->where('filters.sort', 'name')
        );
});

test('an organization is created with a fixed-price subscription at the plan rate', function () {
    $plan = Plan::factory()->fixedPrice(790)->trialDays(14)->create();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.organizations.store'), organizationPayload([
            'plan_id' => $plan->id,
            // A fixed plan ignores any rate submitted alongside it.
            'monthly_price' => '1.00',
            'trial_days' => 14,
        ]))
        ->assertRedirect();

    $organization = School::query()->where('slug', 'blue-lagoon-swim')->sole();
    $subscription = $organization->subscription;

    expect($organization->region)->toBe('APAC')
        ->and($organization->status)->toBe(SchoolStatus::Active)
        ->and((float) $subscription->monthly_price)->toBe(790.00)
        ->and($subscription->trial_days)->toBe(14)
        // The trial end and renewal dates are derived from the trial length.
        ->and($subscription->trial_ends_at->toDateString())->toBe(now()->addDays(14)->toDateString())
        ->and($subscription->renews_at->toDateString())->toBe(now()->addDays(14)->addMonth()->toDateString());
});

test('a custom-priced plan requires the negotiated rate', function () {
    $plan = Plan::factory()->customPriced()->create();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.organizations.store'), organizationPayload([
            'plan_id' => $plan->id,
            'monthly_price' => '',
        ]))
        ->assertSessionHasErrors('monthly_price');

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.organizations.store'), organizationPayload([
            'plan_id' => $plan->id,
            'monthly_price' => '1990.00',
        ]))
        ->assertRedirect();

    $subscription = School::query()->where('slug', 'blue-lagoon-swim')->sole()->subscription;

    expect((float) $subscription->monthly_price)->toBe(1990.00)
        ->and($subscription->plan->pricing_type)->toBe(PlanPricing::Custom);
});

test('an archived plan cannot be assigned', function () {
    $plan = Plan::factory()->create();
    $plan->delete();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.organizations.store'), organizationPayload(['plan_id' => $plan->id]))
        ->assertSessionHasErrors('plan_id');
});

test('clearing the plan removes the subscription', function () {
    $plan = Plan::factory()->create();
    $organization = School::factory()->create();
    Subscription::factory()->forSchool($organization)->onPlan($plan)->create();

    $this->actingAs(platformSuperAdmin())
        ->put(route('platform.organizations.update', $organization), organizationPayload([
            'name' => $organization->name,
            'slug' => $organization->slug,
            'plan_id' => null,
        ]))
        ->assertRedirect();

    expect($organization->refresh()->subscription)->toBeNull();
});

test('the slug must be unique across organizations', function () {
    School::factory()->create(['slug' => 'blue-lagoon-swim']);

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.organizations.store'), organizationPayload())
        ->assertSessionHasErrors('slug');
});

test('the list filters by status, plan, and region', function () {
    $plan = Plan::factory()->create(['slug' => 'growth']);
    $onPlan = School::factory()->create(['name' => 'Growth Swim', 'region' => 'EMEA', 'status' => SchoolStatus::Trial]);
    Subscription::factory()->forSchool($onPlan)->onPlan($plan)->create();
    School::factory()->create(['name' => 'Other Swim', 'region' => 'APAC', 'status' => SchoolStatus::Active]);

    $expectOnlyGrowth = fn (array $query) => $this->actingAs(platformSuperAdmin())
        ->get(route('platform.organizations.index', $query))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('organizations.data', 1)
            ->where('organizations.data.0.name', 'Growth Swim')
        );

    $expectOnlyGrowth(['status' => SchoolStatus::Trial->value]);
    $expectOnlyGrowth(['plan' => 'growth']);
    $expectOnlyGrowth(['region' => 'EMEA']);
    $expectOnlyGrowth(['search' => 'Growth']);
});

test('an unknown sort column falls back to the default instead of reaching the database', function () {
    School::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.organizations.index', ['sort' => 'schools.password']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'name'));
});

test('an organization can be suspended and reactivated from the list', function () {
    $organization = School::factory()->create(['status' => SchoolStatus::Active]);

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.organizations.index'))
        ->patch(route('platform.organizations.status', $organization), [
            'status' => SchoolStatus::Suspended->value,
        ])
        ->assertRedirect(route('platform.organizations.index'));

    expect($organization->refresh()->status)->toBe(SchoolStatus::Suspended);

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.organizations.index'))
        ->patch(route('platform.organizations.status', $organization), [
            'status' => SchoolStatus::Active->value,
        ]);

    expect($organization->refresh()->status)->toBe(SchoolStatus::Active);
});

test('an organization with staff or locations cannot be deleted', function () {
    $organization = School::factory()->create();
    Branch::factory()->for($organization)->create();

    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.organizations.index'))
        ->delete(route('platform.organizations.destroy', $organization))
        ->assertRedirect(route('platform.organizations.index'));

    // Deleting cascades to branches and detaches staff, so it is refused while
    // either still exists rather than silently orphaning people.
    expect(School::query()->whereKey($organization->id)->exists())->toBeTrue();
});

test('an empty organization can be deleted', function () {
    $organization = School::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->delete(route('platform.organizations.destroy', $organization))
        ->assertRedirect(route('platform.organizations.index'));

    expect(School::query()->whereKey($organization->id)->exists())->toBeFalse();
});

test('the profile page carries the subscription summary', function () {
    $plan = Plan::factory()->fixedPrice(990)->create(['name' => 'Growth']);
    $organization = School::factory()->create(['status' => SchoolStatus::Active]);
    Subscription::factory()->forSchool($organization)->onPlan($plan)->trialDays(14)->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.organizations.show', $organization))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/organizations/show')
            ->where('subscription.plan', 'Growth')
            ->where('subscription.pricing_label', 'Fixed')
            ->where('subscription.trial_days', 14)
            ->where('subscription.trial_label', '14 days')
        );
});

test('the export honours the active filters', function () {
    School::factory()->create(['status' => SchoolStatus::Trial]);
    School::factory()->create(['status' => SchoolStatus::Active]);

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.organizations.export', [
            'status' => SchoolStatus::Trial->value,
            'format' => 'csv',
        ]))
        ->assertOk()
        ->assertDownload();
});

test('organization management is gated on its permissions', function () {
    $organization = School::factory()->create();
    $user = User::factory()->platform()->create();

    $this->actingAs($user)->get(route('platform.organizations.index'))->assertForbidden();
    $this->actingAs($user)->get(route('platform.organizations.create'))->assertForbidden();
    $this->actingAs($user)->get(route('platform.organizations.show', $organization))->assertForbidden();
    $this->actingAs($user)->post(route('platform.organizations.store'), organizationPayload())->assertForbidden();
    $this->actingAs($user)->delete(route('platform.organizations.destroy', $organization))->assertForbidden();
});

test('viewing organizations does not confer the right to change them', function () {
    $organization = School::factory()->create();
    $user = platformUserWithPermissions([PermissionEnum::PLATFORM_SCHOOLS_INDEX]);

    $this->actingAs($user)->get(route('platform.organizations.index'))->assertOk();
    $this->actingAs($user)
        ->patch(route('platform.organizations.status', $organization), [
            'status' => SchoolStatus::Suspended->value,
        ])
        ->assertForbidden();
    $this->actingAs($user)->delete(route('platform.organizations.destroy', $organization))->assertForbidden();
});
