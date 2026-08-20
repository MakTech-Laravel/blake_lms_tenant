<?php

namespace App\Http\Controllers\Platform;

use App\Enums\BillingInterval;
use App\Enums\SubscriptionStatus;
use App\Exports\SubscriptionsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\PlatformRefundRequest;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Support\Billing\SubscriptionCheckout;
use App\Support\Billing\SyncSchoolSubscriptionFromStripe;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Subscription as CashierSubscription;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * The Subscriptions module: the plan catalog and the per-organization
 * agreements sold against it, presented as two tabs of one page.
 *
 * Writing to a plan lives on PlanController; this controller owns the read side
 * of both tabs plus billing actions for commercial subscriptions.
 */
class SubscriptionController extends Controller
{
    /**
     * Columns the tracking table may be sorted by, mapped to the SQL expression
     * that orders them. Whitelisted so a query string cannot reach arbitrary
     * columns.
     *
     * @var array<string, string>
     */
    private const SORTABLE = [
        'organization' => 'schools.name',
        'plan' => 'plans.name',
        'mrr' => 'school_subscriptions.monthly_price',
        'renewal' => 'school_subscriptions.renews_at',
        'status' => 'schools.status',
    ];

    private const TABS = ['plans', 'tracking'];

    public function __construct(
        private readonly SubscriptionCheckout $subscriptionCheckout,
        private readonly SyncSchoolSubscriptionFromStripe $syncSchoolSubscriptionFromStripe,
    ) {}

    public function index(Request $request): Response
    {
        $tab = in_array($request->query('tab'), self::TABS, true)
            ? $request->query('tab')
            : 'plans';

        // The plan cards are cheap and anchor the page's header counts, so they
        // are always sent. The tracking query is only built for its own tab.
        $props = [
            'tab' => $tab,
            'plans' => $this->planCards(),
        ];

        if ($tab === 'tracking') {
            $filters = $this->resolveFilters($request);

            $props['tracking'] = $this->trackingQuery($filters)
                ->paginate(15)
                ->withQueryString()
                ->through(fn (Subscription $subscription): array => $this->mapTrackingRow($subscription));
            $props['filters'] = $filters;
            $props['stats'] = $this->trackingStats();
            $props['planOptions'] = $this->planFilterOptions();
            $props['statusOptions'] = SubscriptionStatus::options();
        }

        return Inertia::render('platform/subscriptions/index', $props);
    }

    /**
     * Export the current tracking filters as CSV or Excel.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->resolveFilters($request);
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';

        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(
            new SubscriptionsExport($this->trackingQuery($filters)),
            'subscriptions-'.now()->format('Y-m-d').'.'.$format,
            $writerType,
        );
    }

    /**
     * Send the organization to Stripe Checkout to start or renew billing.
     */
    public function checkout(Subscription $subscription): RedirectResponse
    {
        $subscription->loadMissing(['school', 'plan']);

        abort_if($subscription->school === null, 404);

        $interval = $subscription->billing_interval ?? BillingInterval::Monthly;

        return $this->subscriptionCheckout->redirect(
            $subscription->school,
            $subscription,
            $interval,
            route('platform.subscriptions.index', ['tab' => 'tracking']).'?checkout=success',
            route('platform.subscriptions.index', ['tab' => 'tracking']).'?checkout=cancel',
        );
    }

    public function cancel(Subscription $subscription): RedirectResponse
    {
        $subscription->loadMissing('school');

        abort_if($subscription->school === null, 404);

        $this->cashierSubscription($subscription->school)?->cancel();
        $this->syncSchoolSubscriptionFromStripe->sync($subscription->school);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => ($subscription->school->name ?? 'The subscription').' cancellation scheduled.',
        ]);

        return redirect()->back();
    }

    public function resume(Subscription $subscription): RedirectResponse
    {
        $subscription->loadMissing('school');

        abort_if($subscription->school === null, 404);

        $this->cashierSubscription($subscription->school)?->resume();
        $this->syncSchoolSubscriptionFromStripe->sync($subscription->school);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => ($subscription->school->name ?? 'The subscription').' resumed.',
        ]);

        return redirect()->back();
    }

    public function refund(PlatformRefundRequest $request, Subscription $subscription): RedirectResponse
    {
        $subscription->loadMissing('school');

        abort_if($subscription->school === null, 404);

        $options = [];

        if ($request->filled('amount')) {
            $options['amount'] = (int) $request->validated('amount');
        }

        $subscription->school->refund($request->validated('payment_intent'), $options);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Refund submitted for '.($subscription->school->name ?? 'the organization').'.',
        ]);

        return redirect()->back();
    }

    /**
     * Every plan in the catalog, archived ones included, as the cards the Plans
     * tab renders. The catalog is small enough that paginating it would only
     * get in the way.
     *
     * @return array<int, array<string, mixed>>
     */
    private function planCards(): array
    {
        return Plan::withTrashed()
            ->withCount('subscriptions')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Plan $plan): array => $this->mapPlanCard($plan))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapPlanCard(Plan $plan): array
    {
        return [
            'id' => $plan->id,
            'slug' => $plan->slug,
            'name' => $plan->name,
            'description' => $plan->description ?? '',
            'pricing_type' => $plan->pricing_type->value,
            'pricing_label' => $plan->pricing_type->shortLabel(),
            'price_headline' => $plan->headlinePriceLabel(),
            'price_caption' => $plan->pricing_type->cardCaption(),
            'annual_price_label' => $plan->annualPriceLabel(),
            'limit_badges' => $plan->limitBadges(),
            'features' => $plan->features,
            'trial_label' => $plan->trial_days > 0 ? $plan->trial_days.'-day free trial' : 'No trial',
            'organizations_count' => (int) $plan->subscriptions_count,
            'sort_order' => $plan->sort_order,
            'status' => $plan->trashed() ? 'Archived' : ($plan->is_active ? 'Active' : 'Inactive'),
            'is_popular' => $plan->is_popular,
            'is_active' => $plan->is_active,
            'is_archived' => $plan->trashed(),
            'edit_url' => route('platform.plans.edit', $plan),
            'organizations_url' => route('platform.organizations.index', ['plan' => $plan->slug]),
        ];
    }

    /**
     * @return array{search: string, status: string, plan: string, sort: string, direction: string}
     */
    private function resolveFilters(Request $request): array
    {
        $status = strtolower(trim((string) $request->query('status', '')));
        $sort = strtolower(trim((string) $request->query('sort', '')));
        $direction = strtolower(trim((string) $request->query('direction', '')));

        $statuses = array_map(
            fn (SubscriptionStatus $case): string => $case->value,
            SubscriptionStatus::cases(),
        );

        return [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($status, $statuses, true) ? $status : '',
            'plan' => trim((string) $request->query('plan', '')),
            'sort' => array_key_exists($sort, self::SORTABLE) ? $sort : 'organization',
            'direction' => $direction === 'desc' ? 'desc' : 'asc',
        ];
    }

    /**
     * The shared tracking query. Schools and plans are joined rather than only
     * eager-loaded so the Organization, Plan and Status columns stay sortable in
     * SQL and the derived status stays filterable.
     *
     * @param  array{search: string, status: string, plan: string, sort: string, direction: string}  $filters
     * @return Builder<Subscription>
     */
    private function trackingQuery(array $filters): Builder
    {
        return Subscription::query()
            ->select('school_subscriptions.*')
            ->join('schools', 'schools.id', '=', 'school_subscriptions.school_id')
            // Archived plans are still referenced by live agreements, so the
            // join must not filter them out.
            ->join('plans', 'plans.id', '=', 'school_subscriptions.plan_id')
            ->with(['school:id,name,slug,status,region', 'plan'])
            ->when(
                $filters['search'] !== '',
                fn (Builder $query) => $query->where(function (Builder $builder) use ($filters): void {
                    $term = '%'.$filters['search'].'%';

                    $builder->where('schools.name', 'like', $term)
                        ->orWhere('schools.slug', 'like', $term)
                        ->orWhere('plans.name', 'like', $term);
                }),
            )
            ->when(
                $filters['plan'] !== '',
                fn (Builder $query) => $query->where('plans.slug', $filters['plan']),
            )
            ->when(
                $filters['status'] !== '',
                fn (Builder $query) => SubscriptionStatus::from($filters['status'])->constrain($query),
            )
            ->orderBy(self::SORTABLE[$filters['sort']], $filters['direction'])
            ->orderBy('school_subscriptions.id');
    }

    /**
     * One count per derived status, for the tracking tab's stat cards. Counted
     * in SQL rather than over the loaded page so the numbers describe the whole
     * book of business, not just the current page.
     *
     * @return array<string, int>
     */
    private function trackingStats(): array
    {
        $stats = [];

        foreach (SubscriptionStatus::cases() as $status) {
            $stats[$status->value] = $status
                ->constrain(
                    Subscription::query()->join('schools', 'schools.id', '=', 'school_subscriptions.school_id'),
                )
                ->count();
        }

        return $stats;
    }

    /**
     * Plans that at least one organization is on, so the filter never offers an
     * empty bucket.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function planFilterOptions(): array
    {
        return Plan::withTrashed()
            ->whereHas('subscriptions')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['slug', 'name'])
            ->map(fn (Plan $plan): array => ['value' => $plan->slug, 'label' => $plan->name])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function mapTrackingRow(Subscription $subscription): array
    {
        $status = SubscriptionStatus::forSubscription($subscription);
        $school = $subscription->school;

        return [
            'id' => $subscription->id,
            'organization' => $school?->name ?? '—',
            'organization_slug' => $school?->slug ?? '',
            'region' => $school?->region ?? '—',
            'plan' => $subscription->plan?->name ?? '—',
            'mrr_label' => $status === SubscriptionStatus::Active
                ? '$'.number_format((float) $subscription->monthly_price, 0)
                : '$0',
            'status' => $status->label(),
            'status_value' => $status->value,
            'billing_interval' => $subscription->billing_interval->value,
            'billing_interval_label' => $subscription->billing_interval->label(),
            'stripe_status' => $subscription->stripe_status,
            'renewal_label' => $subscription->renews_at?->format('Y-m-d') ?? '—',
            'trial_label' => $subscription->trial_days > 0 ? $subscription->trial_days.' days' : 'No trial',
            'show_url' => $school !== null ? route('platform.organizations.show', $school) : '',
            'checkout_url' => route('platform.subscriptions.checkout', $subscription),
            'cancel_url' => route('platform.subscriptions.cancel', $subscription),
            'resume_url' => route('platform.subscriptions.resume', $subscription),
            // Derived from the agreement's mirrored Stripe fields so the list
            // does not N+1 into Cashier's subscriptions table.
            'on_stripe' => filled($subscription->stripe_status)
                && $subscription->stripe_status !== 'incomplete',
            'on_grace_period' => $subscription->canceled_at !== null
                && $subscription->renews_at !== null
                && $subscription->renews_at->isFuture(),
        ];
    }

    private function cashierSubscription(School $school): ?CashierSubscription
    {
        return $school->subscription(SubscriptionCheckout::SUBSCRIPTION_NAME);
    }
}
