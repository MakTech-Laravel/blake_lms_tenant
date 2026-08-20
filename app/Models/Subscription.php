<?php

namespace App\Models;

use App\Enums\BillingInterval;
use App\Enums\SubscriptionStatus;
use Carbon\CarbonInterface;
use Database\Factories\SubscriptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Subscription
 * ─────────────────────────────────────────────────────────────────────────────
 * The commercial agreement between the platform and one organization: which
 * plan it is on, the agreed monthly rate, and its trial length. Exactly one per
 * school (enforced by a unique `school_id`).
 *
 * The account lifecycle (active / trial / suspended) lives on the School, not
 * here, because an organization can exist before it has a subscription.
 *
 * @property int $id
 * @property int $school_id
 * @property int $plan_id
 * @property string $monthly_price
 * @property int $trial_days
 * @property Carbon|null $trial_ends_at
 * @property Carbon|null $renews_at
 * @property Carbon|null $canceled_at
 * @property BillingInterval $billing_interval
 * @property string|null $stripe_price_id
 * @property string|null $stripe_status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Subscription extends Model
{
    /** @use HasFactory<SubscriptionFactory> */
    use HasFactory;

    protected $table = 'school_subscriptions';

    /**
     * Stripe caps `trial_period_days` at 730 days (2 years), so authoring a
     * longer trial here could never be honoured once billing is wired up.
     */
    public const TRIAL_DAYS_MAX = 730;

    public const TRIAL_DAYS_MIN = 0;

    protected $fillable = [
        'school_id',
        'plan_id',
        'monthly_price',
        'trial_days',
        'trial_ends_at',
        'renews_at',
        'canceled_at',
        'billing_interval',
        'stripe_price_id',
        'stripe_status',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The organization this subscription belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * The tier this subscription is priced against. Includes archived plans so
     * an existing agreement still resolves after its plan is retired.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class)->withTrashed();
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    /**
     * Derive the trial end and next renewal from a trial length in days.
     *
     * Both dates are Stripe's job once billing is live; until then they are
     * computed from the authored `trial_days` so the Renewal column and the
     * renewal-window filters have something real to work with.
     *
     * @return array{trial_days: int, trial_ends_at: CarbonInterface|null, renews_at: CarbonInterface}
     */
    public static function scheduleFromTrialDays(int $trialDays, ?CarbonInterface $startsAt = null): array
    {
        $days = max(self::TRIAL_DAYS_MIN, min(self::TRIAL_DAYS_MAX, $trialDays));
        $start = $startsAt ?? now();
        $trialEndsAt = $days > 0 ? $start->copy()->addDays($days) : null;

        return [
            'trial_days' => $days,
            'trial_ends_at' => $trialEndsAt,
            // Billing starts when the trial ends, so the first renewal is one
            // month after that rather than one month from today.
            'renews_at' => ($trialEndsAt ?? $start)->copy()->addMonth(),
        ];
    }

    /**
     * Whether the trial window is still open.
     */
    public function onTrial(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isFuture();
    }

    /**
     * Where this subscription stands commercially. Derived rather than stored;
     * see SubscriptionStatus. Requires the `school` relationship.
     */
    public function status(): SubscriptionStatus
    {
        return SubscriptionStatus::forSubscription($this);
    }

    /**
     * Push the next renewal forward by a month, which brings an expired
     * subscription current again. Anchored on the later of today and the
     * existing date so renewing early extends rather than shortens the term.
     */
    public function renew(): void
    {
        $anchor = $this->renews_at !== null && $this->renews_at->isFuture()
            ? $this->renews_at
            : now();

        $this->update(['renews_at' => $anchor->copy()->addMonth()]);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'trial_days' => 'integer',
            'trial_ends_at' => 'datetime',
            'renews_at' => 'datetime',
            'canceled_at' => 'datetime',
            'billing_interval' => BillingInterval::class,
        ];
    }
}
