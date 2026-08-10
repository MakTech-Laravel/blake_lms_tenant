<?php

namespace App\Http\Controllers\Platform;

use App\Enums\BillingInterval;
use App\Enums\SchoolStatus;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Exports\OrganizationsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationRequest;
use App\Http\Requests\Organization\UpdateOrganizationStatusRequest;
use App\Models\Branch;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Platform management of organizations (tenants). The underlying model is
 * School, which is also Spatie's team key; "Organization" is the customer-facing
 * wording used throughout the platform UI and URLs.
 */
class OrganizationController extends Controller
{
    /**
     * Columns the list may be sorted by, mapped to the SQL expression that
     * orders them. Whitelisted so a query string cannot reach arbitrary columns.
     *
     * @var array<string, string>
     */
    private const SORTABLE = [
        'name' => 'schools.name',
        'plan' => 'plan_name',
        'locations' => 'locations_count',
        'staff' => 'staff_count',
        'status' => 'schools.status',
        'renewal' => 'renews_at',
    ];

    public function index(Request $request): Response
    {
        $filters = $this->resolveFilters($request);

        $organizations = $this->organizationsQuery($filters)
            ->paginate(8)
            ->withQueryString()
            ->through(fn (School $school): array => $this->mapOrganization($school));

        return Inertia::render('platform/organizations/index', [
            'organizations' => $organizations,
            'filters' => $filters,
            'stats' => $this->stats(),
            'planOptions' => $this->planOptions(),
            'regionOptions' => $this->regionOptions(),
        ]);
    }

    /**
     * Export the current Organizations filters as CSV or Excel.
     * scope=all (default) exports every matching row; scope=selected exports
     * only the ids the user ticked.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->resolveFilters($request);
        $scope = $request->query('scope') === 'selected' ? 'selected' : 'all';
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';

        $query = $this->organizationsQuery($filters);

        if ($scope === 'selected') {
            $ids = collect($request->query('ids', []))
                ->map(fn (mixed $id): int => (int) $id)
                ->filter(fn (int $id): bool => $id > 0)
                ->unique()
                ->values()
                ->all();

            $query->whereIn('schools.id', $ids !== [] ? $ids : [0]);
        }

        $extension = $format === 'csv' ? 'csv' : 'xlsx';
        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(
            new OrganizationsExport($query),
            'organizations-'.$scope.'-'.now()->format('Y-m-d').'.'.$extension,
            $writerType,
        );
    }

    /**
     * Read-only organization profile: summary, subscription, locations, staff.
     */
    public function show(School $organization): Response
    {
        $organization->load([
            'schoolSubscription.plan',
        ]);

        $organization->loadCount([
            'branches as locations_count',
            'users as staff_count',
            'courses as courses_count',
        ]);

        return Inertia::render('platform/organizations/show', [
            'organization' => $this->organizationSummary($organization),
            'subscription' => $this->subscriptionSummary($organization),
            'locations' => $this->locations($organization),
            'staff' => $this->staff($organization),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('platform/organizations/create', [
            'planOptions' => $this->planOptions(),
            'regionOptions' => $this->regionOptions(),
            'statusOptions' => SchoolStatus::options(),
        ]);
    }

    public function store(StoreOrganizationRequest $request): RedirectResponse
    {
        $organization = School::create($request->safe()->only([
            'name', 'slug', 'email', 'phone', 'address', 'region', 'status',
        ]));

        $this->syncSubscription($organization, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Organization created successfully.']);

        return redirect()->route('platform.organizations.show', $organization);
    }

    public function edit(School $organization): Response
    {
        $organization->load('schoolSubscription');

        return Inertia::render('platform/organizations/edit', [
            'organization' => [
                'id' => $organization->id,
                'slug' => $organization->slug,
                'name' => $organization->name,
                'email' => $organization->email,
                'phone' => $organization->phone,
                'address' => $organization->address,
                'region' => $organization->region,
                'status' => $organization->status->value,
                'plan_id' => $organization->schoolSubscription?->plan_id,
                'monthly_price' => $organization->schoolSubscription?->monthly_price,
                'trial_days' => $organization->schoolSubscription?->trial_days ?? 0,
            ],
            'planOptions' => $this->planOptions(),
            'regionOptions' => $this->regionOptions(),
            'statusOptions' => SchoolStatus::options(),
        ]);
    }

    public function update(UpdateOrganizationRequest $request, School $organization): RedirectResponse
    {
        $organization->update($request->safe()->only([
            'name', 'slug', 'email', 'phone', 'address', 'region', 'status',
        ]));

        $this->syncSubscription($organization, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Organization updated successfully.']);

        return redirect()->route('platform.organizations.show', $organization);
    }

    /**
     * Suspend or reactivate an organization straight from the list.
     */
    public function updateStatus(UpdateOrganizationStatusRequest $request, School $organization): RedirectResponse
    {
        $status = SchoolStatus::from($request->validated('status'));

        $organization->update(['status' => $status]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $status === SchoolStatus::Suspended
                ? $organization->name.' has been suspended.'
                : $organization->name.' is now '.strtolower($status->label()).'.',
        ]);

        return redirect()->back();
    }

    public function destroy(School $organization): RedirectResponse
    {
        // Deleting a school cascades to its branches and detaches its staff, so
        // refuse while either still exists rather than silently orphaning people.
        $staffCount = $organization->users()->count();
        $locationCount = $organization->branches()->count();

        if ($staffCount > 0 || $locationCount > 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Remove this organization\'s '.$staffCount.' staff and '.$locationCount.' locations before deleting it.',
            ]);

            return redirect()->back();
        }

        $organization->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Organization deleted successfully.']);

        return redirect()->route('platform.organizations.index');
    }

    /**
     * @return array{search: string, status: string, plan: string, region: string, renewal: string, sort: string, direction: string}
     */
    private function resolveFilters(Request $request): array
    {
        $status = strtolower(trim((string) $request->query('status', '')));
        $renewal = strtolower(trim((string) $request->query('renewal', '')));
        $sort = strtolower(trim((string) $request->query('sort', '')));
        $direction = strtolower(trim((string) $request->query('direction', '')));

        $statuses = array_map(fn (SchoolStatus $case): string => $case->value, SchoolStatus::cases());

        return [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($status, $statuses, true) ? $status : '',
            'plan' => trim((string) $request->query('plan', '')),
            'region' => trim((string) $request->query('region', '')),
            'renewal' => in_array($renewal, ['30', '90', 'overdue'], true) ? $renewal : '',
            'sort' => array_key_exists($sort, self::SORTABLE) ? $sort : 'name',
            'direction' => $direction === 'desc' ? 'desc' : 'asc',
        ];
    }

    /**
     * The shared list query. Subscription columns are joined rather than only
     * eager-loaded so the Plan and Renewal columns remain sortable in SQL.
     *
     * @param  array{search: string, status: string, plan: string, region: string, renewal: string, sort: string, direction: string}  $filters
     * @return Builder<School>
     */
    private function organizationsQuery(array $filters): Builder
    {
        return School::query()
            ->select('schools.*')
            ->leftJoin('school_subscriptions', 'school_subscriptions.school_id', '=', 'schools.id')
            ->leftJoin('plans', 'plans.id', '=', 'school_subscriptions.plan_id')
            ->addSelect([
                'plans.name as plan_name',
                'plans.slug as plan_slug',
                'school_subscriptions.monthly_price as subscription_price',
                'school_subscriptions.renews_at as renews_at',
                'school_subscriptions.trial_ends_at as trial_ends_at',
            ])
            ->with('schoolSubscription.plan')
            ->withCount([
                'branches as locations_count',
                'users as staff_count',
            ])
            ->when(
                $filters['search'] !== '',
                fn (Builder $query) => $query->where(function (Builder $builder) use ($filters): void {
                    $term = '%'.$filters['search'].'%';

                    $builder->where('schools.name', 'like', $term)
                        ->orWhere('schools.slug', 'like', $term)
                        ->orWhere('schools.email', 'like', $term);
                }),
            )
            ->when(
                $filters['status'] !== '',
                fn (Builder $query) => $query->where('schools.status', $filters['status']),
            )
            ->when(
                $filters['plan'] !== '',
                fn (Builder $query) => $query->where('plans.slug', $filters['plan']),
            )
            ->when(
                $filters['region'] !== '',
                fn (Builder $query) => $query->where('schools.region', $filters['region']),
            )
            ->when(
                $filters['renewal'] === '30',
                fn (Builder $query) => $query->whereBetween('school_subscriptions.renews_at', [now(), now()->addDays(30)]),
            )
            ->when(
                $filters['renewal'] === '90',
                fn (Builder $query) => $query->whereBetween('school_subscriptions.renews_at', [now(), now()->addDays(90)]),
            )
            ->when(
                $filters['renewal'] === 'overdue',
                fn (Builder $query) => $query->whereNotNull('school_subscriptions.renews_at')
                    ->where('school_subscriptions.renews_at', '<', now()),
            )
            ->orderBy(self::SORTABLE[$filters['sort']], $filters['direction'])
            ->orderBy('schools.id');
    }

    /**
     * Headline numbers for the stat cards. MRR counts only billable (active)
     * organizations, so trials and suspensions contribute nothing.
     *
     * @return array{trial: int, suspended: int, total: int, mrr: float, mrr_label: string}
     */
    private function stats(): array
    {
        $counts = School::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $mrr = (float) Subscription::query()
            ->whereHas('school', fn (Builder $query) => $query->where('status', SchoolStatus::Active->value))
            ->sum('monthly_price');

        return [
            'trial' => (int) ($counts[SchoolStatus::Trial->value] ?? 0),
            'suspended' => (int) ($counts[SchoolStatus::Suspended->value] ?? 0),
            'total' => (int) $counts->sum(),
            'mrr' => $mrr,
            'mrr_label' => $this->moneyLabel($mrr),
        ];
    }

    /**
     * Compact currency for the stat card, e.g. 8910.0 → "$8.9K".
     */
    private function moneyLabel(float $amount): string
    {
        if ($amount >= 1_000_000) {
            return '$'.round($amount / 1_000_000, 1).'M';
        }

        if ($amount >= 1_000) {
            return '$'.round($amount / 1_000, 1).'K';
        }

        return '$'.number_format($amount, 0);
    }

    /**
     * @return array{
     *     id: int,
     *     slug: string,
     *     name: string,
     *     initials: string,
     *     region: string,
     *     email: string,
     *     plan: string,
     *     plan_slug: string,
     *     locations_count: int,
     *     staff_count: int,
     *     status: string,
     *     status_value: string,
     *     mrr_label: string,
     *     renewal_label: string,
     *     show_url: string,
     *     edit_url: string
     * }
     */
    private function mapOrganization(School $school): array
    {
        $subscription = $school->schoolSubscription;

        return [
            'id' => $school->id,
            'slug' => $school->slug,
            'name' => $school->name,
            'initials' => $this->initials($school->name),
            'region' => $school->region ?? '—',
            'email' => $school->email ?? '—',
            'plan' => $subscription?->plan?->name ?? 'No plan',
            'plan_slug' => $subscription?->plan?->slug ?? '',
            'locations_count' => (int) $school->locations_count,
            'staff_count' => (int) $school->staff_count,
            'status' => $school->status->label(),
            'status_value' => $school->status->value,
            'mrr_label' => $school->status->isBillable()
                ? '$'.number_format((float) ($subscription?->monthly_price ?? 0), 0)
                : '$0',
            'renewal_label' => optional($subscription?->renews_at)?->format('Y-m-d') ?? '—',
            'show_url' => route('platform.organizations.show', $school),
            'edit_url' => route('platform.organizations.edit', $school),
        ];
    }

    /**
     * @return array{
     *     id: int,
     *     slug: string,
     *     name: string,
     *     initials: string,
     *     email: string,
     *     phone: string,
     *     address: string,
     *     region: string,
     *     status: string,
     *     status_value: string,
     *     locations_count: int,
     *     staff_count: int,
     *     courses_count: int,
     *     created_label: string,
     *     updated_relative: string
     * }
     */
    private function organizationSummary(School $school): array
    {
        return [
            'id' => $school->id,
            'slug' => $school->slug,
            'name' => $school->name,
            'initials' => $this->initials($school->name),
            'email' => $school->email ?? '—',
            'phone' => $school->phone ?? '—',
            'address' => $school->address ?? '—',
            'region' => $school->region ?? '—',
            'status' => $school->status->label(),
            'status_value' => $school->status->value,
            'locations_count' => (int) $school->locations_count,
            'staff_count' => (int) $school->staff_count,
            'courses_count' => (int) $school->courses_count,
            'created_label' => $school->created_at?->format('M j, Y') ?? '—',
            'updated_relative' => $school->updated_at?->diffForHumans() ?? '—',
        ];
    }

    /**
     * @return array{
     *     plan: string,
     *     plan_description: string,
     *     pricing_label: string,
     *     monthly_price_label: string,
     *     mrr_label: string,
     *     renewal_label: string,
     *     renewal_relative: string,
     *     trial_days: int,
     *     trial_label: string,
     *     trial_ends_label: string,
     *     is_billable: bool
     * }|null
     */
    private function subscriptionSummary(School $school): ?array
    {
        $subscription = $school->schoolSubscription;

        if ($subscription === null) {
            return null;
        }

        $trialDays = (int) $subscription->trial_days;

        return [
            'plan' => $subscription->plan?->name ?? '—',
            'plan_description' => $subscription->plan?->description ?? '',
            'pricing_label' => $subscription->plan?->pricing_type->shortLabel() ?? '—',
            'monthly_price_label' => '$'.number_format((float) $subscription->monthly_price, 2),
            'mrr_label' => $school->status->isBillable()
                ? '$'.number_format((float) $subscription->monthly_price, 0)
                : '$0',
            'renewal_label' => optional($subscription->renews_at)?->format('M j, Y') ?? '—',
            'renewal_relative' => optional($subscription->renews_at)?->diffForHumans() ?? '—',
            'trial_days' => $trialDays,
            'trial_label' => $trialDays > 0 ? $trialDays.' days' : 'No trial',
            'trial_ends_label' => optional($subscription->trial_ends_at)?->format('M j, Y') ?? '—',
            'is_billable' => $school->status->isBillable(),
        ];
    }

    /**
     * @return array<int, array{id: int, name: string, slug: string, address: string, staff_count: int, status: string}>
     */
    private function locations(School $school): array
    {
        return $school->branches()
            ->withCount('users as staff_count')
            ->orderBy('name')
            ->get()
            ->map(fn (Branch $branch): array => [
                'id' => $branch->id,
                'name' => $branch->name,
                'slug' => $branch->slug,
                'address' => $branch->address ?? '—',
                'staff_count' => (int) $branch->staff_count,
                'status' => $branch->is_active ? 'Active' : 'Inactive',
            ])
            ->all();
    }

    /**
     * Staff accounts at this organization, capped so a large tenant cannot bloat
     * the payload. Teachers are excluded — they are learners, not staff.
     *
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     initials: string,
     *     avatar_url: string|null,
     *     branch: string,
     *     status: string,
     *     profile_url: string
     * }>
     */
    private function staff(School $school): array
    {
        return $school->users()
            ->where('type', UserType::SCHOOL)
            ->with('branch:id,name')
            ->orderBy('name')
            ->limit(50)
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'initials' => $user->initials(),
                'avatar_url' => $user->avatarUrl(),
                'branch' => $user->branch?->name ?? 'Head office',
                'status' => $user->status?->label() ?? UserStatus::Active->label(),
                'profile_url' => route('platform.people.show', $user),
            ])
            ->all();
    }

    /**
     * Create, update, or remove the organization's subscription based on whether
     * a plan was submitted. Clearing the plan removes the subscription.
     *
     * The rate comes from the plan, not the request, whenever the plan is
     * fixed-price — that is what makes a fixed rate unchangeable per
     * organization even if a price is posted directly. Renewal and trial-end
     * dates are derived from the trial length rather than authored, and the
     * existing subscription's creation date anchors them so editing an
     * organization does not silently push its renewal forward.
     *
     * @param  array<string, mixed>  $data
     */
    private function syncSubscription(School $organization, array $data): void
    {
        $planId = $data['plan_id'] ?? null;

        if ($planId === null) {
            $organization->schoolSubscription()->delete();

            return;
        }

        $plan = Plan::find($planId);

        if ($plan === null) {
            return;
        }

        $existing = $organization->schoolSubscription;

        $organization->schoolSubscription()->updateOrCreate(
            ['school_id' => $organization->id],
            [
                'plan_id' => $plan->id,
                'monthly_price' => $plan->rateFor($data['monthly_price'] ?? null),
                'billing_interval' => BillingInterval::tryFrom((string) ($data['billing_interval'] ?? ''))
                    ?? BillingInterval::Monthly,
                ...Subscription::scheduleFromTrialDays(
                    (int) ($data['trial_days'] ?? $plan->trial_days),
                    $existing?->created_at,
                ),
            ],
        );
    }

    /**
     * Assignable plans, carrying enough pricing metadata for the form to lock
     * the rate field on fixed-price plans and prefill the trial length.
     *
     * @return array<int, array{
     *     value: string,
     *     label: string,
     *     id: int,
     *     pricing_type: string,
     *     monthly_price: float|null,
     *     price_label: string,
     *     trial_days: int
     * }>
     */
    private function planOptions(): array
    {
        return Plan::query()
            ->selectable()
            ->get()
            ->map(fn (Plan $plan): array => [
                'value' => $plan->slug,
                'label' => $plan->name,
                'id' => $plan->id,
                'pricing_type' => $plan->pricing_type->value,
                'monthly_price' => $plan->monthly_price === null ? null : (float) $plan->monthly_price,
                'price_label' => $plan->priceLabel(),
                'trial_days' => $plan->trial_days,
            ])
            ->all();
    }

    /**
     * Regions actually in use, so the filter never offers an empty bucket.
     *
     * @return array<int, array{value: string, label: string}>
     */
    private function regionOptions(): array
    {
        return School::query()
            ->whereNotNull('region')
            ->distinct()
            ->orderBy('region')
            ->pluck('region')
            ->map(fn (string $region): array => ['value' => $region, 'label' => $region])
            ->all();
    }

    /**
     * Two-letter monogram for the avatar, e.g. "Blue Wave Swim Academy" → "BW".
     */
    private function initials(string $name): string
    {
        $words = preg_split('/\s+/', trim($name)) ?: [];

        $letters = Collection::make($words)
            ->filter()
            ->take(2)
            ->map(fn (string $word): string => mb_strtoupper(mb_substr($word, 0, 1)))
            ->implode('');

        return $letters !== '' ? $letters : mb_strtoupper(mb_substr($name, 0, 2));
    }
}
