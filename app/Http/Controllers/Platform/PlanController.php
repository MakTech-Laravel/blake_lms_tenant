<?php

namespace App\Http\Controllers\Platform;

use App\Enums\PlanPricing;
use App\Http\Controllers\Controller;
use App\Http\Requests\Plan\StorePlanRequest;
use App\Http\Requests\Plan\UpdatePlanRequest;
use App\Jobs\SyncPlanToStripe;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Editing the subscription plan catalog. The catalog itself is listed on the
 * Plans tab of the Subscriptions page (see SubscriptionController), so this
 * controller only owns the write side plus the two editor pages.
 *
 * Plans are archived rather than deleted: retiring one must not break the
 * organizations already priced against it, so `destroy` soft-deletes and the
 * agreement keeps resolving its plan via `withTrashed()`. An archived plan
 * simply drops out of the assignable list.
 */
class PlanController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('platform/plans/create', [
            'pricingOptions' => PlanPricing::options(),
            'trialDaysMax' => Subscription::TRIAL_DAYS_MAX,
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        $plan = Plan::create($this->attributes($request->validated()));

        $this->keepOnePopularPlan($plan);
        SyncPlanToStripe::dispatch($plan->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plan created successfully.']);

        return redirect()->route('platform.subscriptions.index');
    }

    public function edit(Plan $plan): Response
    {
        return Inertia::render('platform/plans/edit', [
            'plan' => [
                'id' => $plan->id,
                'slug' => $plan->slug,
                'name' => $plan->name,
                'pricing_type' => $plan->pricing_type->value,
                'monthly_price' => $plan->monthly_price,
                'annual_price' => $plan->annual_price,
                'description' => $plan->description,
                'staff_limit' => $plan->staff_limit,
                'location_limit' => $plan->location_limit,
                'course_limit' => $plan->course_limit,
                'storage_gb' => $plan->storage_gb,
                'features' => $plan->features,
                'is_popular' => $plan->is_popular,
                'trial_days' => $plan->trial_days,
                'sort_order' => $plan->sort_order,
                'is_active' => $plan->is_active,
            ],
            'pricingOptions' => PlanPricing::options(),
            'trialDaysMax' => Subscription::TRIAL_DAYS_MAX,
            'subscriptionsCount' => $plan->subscriptions()->count(),
        ]);
    }

    public function update(UpdatePlanRequest $request, Plan $plan): RedirectResponse
    {
        $plan->update($this->attributes($request->validated()));

        $this->keepOnePopularPlan($plan);
        SyncPlanToStripe::dispatch($plan->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Plan updated successfully.']);

        return redirect()->route('platform.subscriptions.index');
    }

    /**
     * Copy a plan so a variant can be edited without disturbing the original.
     * The copy starts unavailable and never inherits the popular ribbon.
     */
    public function duplicate(Plan $plan): RedirectResponse
    {
        $copy = $plan->replicate(['created_at', 'updated_at', 'deleted_at']);

        $copy->name = $plan->name.' (Copy)';
        $copy->slug = $this->uniqueSlug($plan->slug);
        $copy->is_active = false;
        $copy->is_popular = false;
        $copy->sort_order = $plan->sort_order + 1;
        $copy->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $copy->name.' created as a draft. Turn it on when you are ready to offer it.',
        ]);

        return redirect()->route('platform.plans.edit', $copy);
    }

    /**
     * Archive the plan. Organizations already on it keep their agreement and
     * their rate; the plan just stops being offered to anyone new.
     */
    public function destroy(Plan $plan): RedirectResponse
    {
        $subscribers = $plan->subscriptions()->count();

        $plan->delete();
        SyncPlanToStripe::dispatch($plan->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $subscribers > 0
                ? $plan->name.' archived. '.$subscribers.' existing '
                    .str('organization')->plural($subscribers).' keep their current rate.'
                : $plan->name.' archived.',
        ]);

        return redirect()->back();
    }

    /**
     * Return an archived plan to the catalog.
     */
    public function restore(Plan $plan): RedirectResponse
    {
        $plan->restore();
        SyncPlanToStripe::dispatch($plan->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => $plan->name.' restored to the catalog.']);

        return redirect()->back();
    }

    /**
     * Map validated input onto the model's columns. Custom-priced plans store a
     * NULL rate: the amount is agreed per organization instead. A blank limit
     * means unlimited, so it is stored as NULL rather than zero.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function attributes(array $data): array
    {
        $pricing = PlanPricing::from($data['pricing_type']);

        return [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'pricing_type' => $pricing,
            'monthly_price' => $pricing->isCustom() ? null : $data['monthly_price'],
            'annual_price' => $pricing->isCustom() ? null : ($data['annual_price'] ?? null),
            'description' => $data['description'] ?? null,
            'staff_limit' => $this->limit($data['staff_limit'] ?? null),
            'location_limit' => $this->limit($data['location_limit'] ?? null),
            'course_limit' => $this->limit($data['course_limit'] ?? null),
            'storage_gb' => $this->limit($data['storage_gb'] ?? null),
            'features' => array_values($data['features'] ?? []),
            'is_popular' => (bool) ($data['is_popular'] ?? false),
            'trial_days' => (int) $data['trial_days'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ];
    }

    /**
     * Blank means unlimited, which the schema represents as NULL.
     */
    private function limit(mixed $value): ?int
    {
        return blank($value) ? null : (int) $value;
    }

    /**
     * The "most popular" ribbon marks one plan, so promoting a plan demotes
     * whichever one held it.
     */
    private function keepOnePopularPlan(Plan $plan): void
    {
        if (! $plan->is_popular) {
            return;
        }

        Plan::query()
            ->whereKeyNot($plan->id)
            ->where('is_popular', true)
            ->update(['is_popular' => false]);
    }

    /**
     * A slug that is free, including among archived plans, by appending a
     * counter until nothing claims it.
     */
    private function uniqueSlug(string $base): string
    {
        $candidate = $base.'-copy';
        $suffix = 2;

        while (Plan::withTrashed()->where('slug', $candidate)->exists()) {
            $candidate = $base.'-copy-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
