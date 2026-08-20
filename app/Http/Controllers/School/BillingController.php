<?php

namespace App\Http\Controllers\School;

use App\Enums\BillingInterval;
use App\Enums\PlanPricing;
use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\SchoolCheckoutRequest;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Support\Billing\SubscriptionCheckout;
use App\Support\Billing\SyncSchoolSubscriptionFromStripe;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Checkout;
use Laravel\Cashier\Subscription as CashierSubscription;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The school's own billing desk: current agreement, Stripe Checkout, portal,
 * invoices, and cancel/resume — all gated by school.billing.* permissions.
 */
class BillingController extends Controller
{
    public function __construct(
        private readonly SubscriptionCheckout $subscriptionCheckout,
        private readonly SyncSchoolSubscriptionFromStripe $syncSchoolSubscriptionFromStripe,
    ) {}

    public function index(School $school): Response
    {
        $school->load(['schoolSubscription.plan']);

        $cashierSubscription = $school->subscription(SubscriptionCheckout::SUBSCRIPTION_NAME);

        return Inertia::render('school/billing/index', [
            'subscription' => $this->subscriptionProps($school, $cashierSubscription),
            'availablePlans' => $this->availablePlanProps($school),
            'intervalOptions' => BillingInterval::options(),
            'invoices' => $this->invoiceProps($school),
            'paymentMethod' => $school->pm_type
                ? [
                    'type' => $school->pm_type,
                    'last_four' => $school->pm_last_four,
                ]
                : null,
            'checkoutStatus' => request()->query('checkout'),
        ]);
    }

    public function checkout(SchoolCheckoutRequest $request, School $school): Checkout|RedirectResponse
    {
        $plan = Plan::query()
            ->whereKey($request->validated('plan_id'))
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->firstOrFail();

        $interval = BillingInterval::from($request->validated('interval'));
        $schoolSubscription = $this->resolveAgreementForCheckout($school, $plan, $interval);

        return $this->subscriptionCheckout->redirect(
            $school,
            $schoolSubscription,
            $interval,
            route('school.billing.index', $school).'?checkout=success',
            route('school.billing.index', $school).'?checkout=cancel',
        );
    }

    public function portal(School $school): RedirectResponse
    {
        return $school->redirectToBillingPortal(route('school.billing.index', $school));
    }

    public function cancel(School $school): RedirectResponse
    {
        $this->cashierSubscription($school)?->cancel();

        $this->syncSchoolSubscriptionFromStripe->sync($school);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subscription cancellation scheduled.']);

        return redirect()->back();
    }

    public function resume(School $school): RedirectResponse
    {
        $this->cashierSubscription($school)?->resume();

        $this->syncSchoolSubscriptionFromStripe->sync($school);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Subscription resumed.']);

        return redirect()->back();
    }

    public function downloadInvoice(School $school, string $invoice): StreamedResponse
    {
        return $school->downloadInvoice($invoice, [
            'vendor' => config('app.name'),
            'product' => 'Subscription',
        ]);
    }

    public function export(Request $request, School $school): StreamedResponse
    {
        $invoices = $school->hasStripeId() ? $school->invoices() : collect();

        $filename = 'billing-'.$school->slug.'-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($invoices): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Number', 'Date', 'Total', 'Status']);

            foreach ($invoices as $invoice) {
                fputcsv($handle, [
                    $invoice->number,
                    $invoice->date()->format('Y-m-d'),
                    $invoice->total(),
                    $invoice->status,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Fixed plans are self-serve; a custom plan is only checkoutable when the
     * platform already assigned this school that plan (negotiated rate locked).
     */
    private function resolveAgreementForCheckout(
        School $school,
        Plan $plan,
        BillingInterval $interval,
    ): Subscription {
        $existing = $school->schoolSubscription;

        if ($plan->hasCustomPricing()) {
            abort_unless(
                $existing !== null && $existing->plan_id === $plan->id,
                422,
                'Custom-priced plans can only be paid after the platform assigns a negotiated rate.',
            );

            $existing->update(['billing_interval' => $interval]);

            return $existing->fresh(['plan']);
        }

        $trialDays = $existing?->plan_id === $plan->id
            ? $existing->trial_days
            : $plan->trial_days;

        return Subscription::query()->updateOrCreate(
            ['school_id' => $school->id],
            [
                'plan_id' => $plan->id,
                'monthly_price' => $plan->rateFor(null),
                'billing_interval' => $interval,
                ...Subscription::scheduleFromTrialDays($trialDays),
            ],
        )->load('plan');
    }

    /**
     * @return array<string, mixed>|null
     */
    private function subscriptionProps(School $school, ?CashierSubscription $cashierSubscription): ?array
    {
        $schoolSubscription = $school->schoolSubscription;

        if ($schoolSubscription === null) {
            return null;
        }

        return [
            'plan_id' => $schoolSubscription->plan_id,
            'plan_name' => $schoolSubscription->plan?->name,
            'pricing_type' => $schoolSubscription->plan?->pricing_type->value,
            'monthly_price' => $schoolSubscription->monthly_price,
            'mrr_label' => '$'.number_format((float) $schoolSubscription->monthly_price, 0),
            'billing_interval' => $schoolSubscription->billing_interval->value,
            'billing_interval_label' => $schoolSubscription->billing_interval->label(),
            'trial_days' => $schoolSubscription->trial_days,
            'trial_ends_at' => $schoolSubscription->trial_ends_at?->toIso8601String(),
            'trial_label' => $schoolSubscription->trial_ends_at?->format('M j, Y'),
            'renews_at' => $schoolSubscription->renews_at?->toIso8601String(),
            'renewal_label' => $schoolSubscription->renews_at?->format('M j, Y') ?? '—',
            'canceled_at' => $schoolSubscription->canceled_at?->toIso8601String(),
            'stripe_status' => $schoolSubscription->stripe_status,
            'status_label' => $schoolSubscription->status()->label(),
            'on_stripe' => $cashierSubscription !== null,
            'on_grace_period' => $cashierSubscription?->onGracePeriod() ?? false,
            'ends_at' => $cashierSubscription?->ends_at?->toIso8601String(),
        ];
    }

    /**
     * Catalog cards the school may start Checkout against.
     *
     * @return array<int, array<string, mixed>>
     */
    private function availablePlanProps(School $school): array
    {
        $assignedCustomId = $school->schoolSubscription?->plan?->hasCustomPricing()
            ? $school->schoolSubscription->plan_id
            : null;

        return Plan::query()
            ->where('is_active', true)
            ->where(function ($query) use ($assignedCustomId): void {
                $query->where('pricing_type', PlanPricing::Fixed)
                    ->when(
                        $assignedCustomId !== null,
                        fn ($builder) => $builder->orWhereKey($assignedCustomId),
                    );
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Plan $plan): array => [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description ?? '',
                'pricing_type' => $plan->pricing_type->value,
                'price_headline' => $plan->headlinePriceLabel(),
                'annual_price_label' => $plan->annualPriceLabel(),
                'trial_label' => $plan->trial_days > 0 ? $plan->trial_days.'-day free trial' : 'No trial',
                'features' => $plan->features,
                'is_popular' => $plan->is_popular,
                'has_monthly_price' => filled($plan->stripe_monthly_price_id) || $plan->hasCustomPricing(),
                'has_annual_price' => filled($plan->stripe_annual_price_id)
                    || ($plan->hasCustomPricing() && $plan->annual_price !== null)
                    || $plan->hasCustomPricing(),
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function invoiceProps(School $school): array
    {
        if (! $school->hasStripeId()) {
            return [];
        }

        try {
            return collect($school->invoices())
                ->map(fn ($invoice): array => [
                    'id' => $invoice->id,
                    'number' => $invoice->number,
                    'date' => $invoice->date()->format('Y-m-d'),
                    'total' => $invoice->total(),
                    'status' => $invoice->status,
                    'download_url' => route('school.billing.invoices.download', [$school, $invoice->id]),
                ])
                ->all();
        } catch (\Throwable) {
            // No Stripe keys / network in local and CI — the page still loads.
            return [];
        }
    }

    private function cashierSubscription(School $school): ?CashierSubscription
    {
        return $school->subscription(SubscriptionCheckout::SUBSCRIPTION_NAME);
    }
}
