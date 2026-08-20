<?php

namespace App\Enums;

use App\Models\Subscription;
use Illuminate\Contracts\Database\Query\Builder;

/**
 * Where a subscription stands commercially.
 *
 * Not a stored column. A subscription's standing is a function of the
 * organization's account status and two dates, so persisting it would be a
 * second source of truth that goes stale the moment a renewal date passes.
 *
 * The order matters: a suspended organization reads as Suspended whatever its
 * dates say, and a live trial outranks an overdue renewal because the trial has
 * not been billed yet.
 */
enum SubscriptionStatus: string
{
    case Active = 'active';
    case Trial = 'trial';
    case Expired = 'expired';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Trial => 'Trial',
            self::Expired => 'Expired',
            self::Suspended => 'Suspended',
        };
    }

    /**
     * Resolve the status of a loaded subscription. Requires the school
     * relationship, so eager-load it to avoid a query per row.
     */
    public static function forSubscription(Subscription $subscription): self
    {
        if ($subscription->school?->status === SchoolStatus::Suspended) {
            return self::Suspended;
        }

        if ($subscription->onTrial()) {
            return self::Trial;
        }

        if ($subscription->renews_at !== null && $subscription->renews_at->isPast()) {
            return self::Expired;
        }

        return self::Active;
    }

    /**
     * Constrain a subscriptions query to this status.
     *
     * The same precedence as `forSubscription()` expressed in SQL, so the
     * tracking table can filter and count by status without loading every row.
     * Expects `schools` to be joined.
     *
     * @param  Builder<*>  $query
     */
    public function constrain(Builder $query): Builder
    {
        $suspended = SchoolStatus::Suspended->value;

        return match ($this) {
            self::Suspended => $query->where('schools.status', $suspended),

            self::Trial => $query->where('schools.status', '!=', $suspended)
                ->whereNotNull('school_subscriptions.trial_ends_at')
                ->where('school_subscriptions.trial_ends_at', '>', now()),

            self::Expired => $query->where('schools.status', '!=', $suspended)
                ->where(fn (Builder $builder) => $builder
                    ->whereNull('school_subscriptions.trial_ends_at')
                    ->orWhere('school_subscriptions.trial_ends_at', '<=', now()))
                ->whereNotNull('school_subscriptions.renews_at')
                ->where('school_subscriptions.renews_at', '<', now()),

            self::Active => $query->where('schools.status', '!=', $suspended)
                ->where(fn (Builder $builder) => $builder
                    ->whereNull('school_subscriptions.trial_ends_at')
                    ->orWhere('school_subscriptions.trial_ends_at', '<=', now()))
                ->where(fn (Builder $builder) => $builder
                    ->whereNull('school_subscriptions.renews_at')
                    ->orWhere('school_subscriptions.renews_at', '>=', now())),
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status): array => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
