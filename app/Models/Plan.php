<?php

namespace App\Models;

use App\Enums\BillingInterval;
use App\Enums\PlanPricing;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Plan
 * ─────────────────────────────────────────────────────────────────────────────
 * A subscription tier an organization can be placed on.
 *
 * Fixed-price plans carry their rate here and every organization on the plan
 * pays it. Custom-price plans have a NULL `monthly_price`: the rate is quoted
 * per deal and stored on the Subscription instead.
 *
 * Plans are soft-deleted so archiving one never orphans the subscriptions
 * priced against it.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property PlanPricing $pricing_type
 * @property string|null $monthly_price
 * @property string|null $annual_price
 * @property string|null $description
 * @property int|null $staff_limit
 * @property int|null $location_limit
 * @property int|null $course_limit
 * @property int|null $storage_gb
 * @property array<int, string> $features
 * @property bool $is_popular
 * @property int $trial_days
 * @property int $sort_order
 * @property bool $is_active
 * @property string|null $stripe_product_id
 * @property string|null $stripe_monthly_price_id
 * @property string|null $stripe_annual_price_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'pricing_type',
        'monthly_price',
        'annual_price',
        'description',
        'staff_limit',
        'location_limit',
        'course_limit',
        'storage_gb',
        'features',
        'is_popular',
        'trial_days',
        'sort_order',
        'is_active',
        'stripe_product_id',
        'stripe_monthly_price_id',
        'stripe_annual_price_id',
    ];

    /**
     * Resolve `{plan}` route bindings by slug, matching School and Branch.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Organizations currently priced against this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    /**
     * The Stripe Price id for a fixed plan at the given billing interval.
     */
    public function stripePriceIdFor(BillingInterval $interval): ?string
    {
        return match ($interval) {
            BillingInterval::Monthly => $this->stripe_monthly_price_id,
            BillingInterval::Annual => $this->stripe_annual_price_id,
        };
    }

    /**
     * Whether the rate is negotiated per organization rather than fixed here.
     */
    public function hasCustomPricing(): bool
    {
        return $this->pricing_type->isCustom();
    }

    /**
     * The rate to bill an organization placed on this plan.
     *
     * Fixed plans always win over whatever was submitted, which is what makes
     * their price unchangeable per organization. Custom plans have no list
     * price, so the caller's negotiated amount is used.
     */
    public function rateFor(float|int|string|null $negotiated): float
    {
        if ($this->hasCustomPricing()) {
            return (float) ($negotiated ?? 0);
        }

        return (float) ($this->monthly_price ?? 0);
    }

    /**
     * Display-ready price, e.g. "$990.00" or "Custom".
     */
    public function priceLabel(): string
    {
        if ($this->hasCustomPricing()) {
            return 'Custom';
        }

        return '$'.number_format((float) $this->monthly_price, 2);
    }

    /**
     * The headline shown on the plan card: a rounded monthly figure, or the
     * invitation to negotiate that custom-priced plans get instead.
     */
    public function headlinePriceLabel(): string
    {
        if ($this->hasCustomPricing()) {
            return "Let's Talk";
        }

        return '$'.number_format((float) $this->monthly_price, 0);
    }

    /**
     * Annual rate, or null when the plan has no annual option.
     */
    public function annualPriceLabel(): ?string
    {
        if ($this->hasCustomPricing() || $this->annual_price === null) {
            return null;
        }

        return '$'.number_format((float) $this->annual_price, 0).' /year';
    }

    /**
     * Included storage, switching to TB once the figure would read awkwardly in
     * gigabytes. NULL storage means unlimited.
     */
    public function storageLabel(): string
    {
        if ($this->storage_gb === null) {
            return 'Unlimited storage';
        }

        if ($this->storage_gb >= 1024) {
            return round($this->storage_gb / 1024, 1).'TB storage';
        }

        return $this->storage_gb.'GB storage';
    }

    /**
     * A single limit badge, e.g. "25 staff" or "Unlimited locations".
     */
    public function limitLabel(?int $limit, string $noun): string
    {
        if ($limit === null) {
            return 'Unlimited '.Str::plural($noun);
        }

        return $limit.' '.Str::plural($noun, $limit);
    }

    /**
     * The badges under the price on the plan card.
     *
     * @return array<int, string>
     */
    public function limitBadges(): array
    {
        return [
            $this->limitLabel($this->staff_limit, 'staff member'),
            $this->limitLabel($this->location_limit, 'location'),
            $this->limitLabel($this->course_limit, 'course'),
            $this->storageLabel(),
        ];
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Only plans that can still be assigned, in display order.
     */
    public function scopeSelectable(Builder $query): void
    {
        $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pricing_type' => PlanPricing::class,
            'monthly_price' => 'decimal:2',
            'annual_price' => 'decimal:2',
            'staff_limit' => 'integer',
            'location_limit' => 'integer',
            'course_limit' => 'integer',
            'storage_gb' => 'integer',
            'features' => 'array',
            'is_popular' => 'boolean',
            'trial_days' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
