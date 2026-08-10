<?php

namespace App\Enums;

/**
 * How often a school subscription is billed through Stripe.
 */
enum BillingInterval: string
{
    case Monthly = 'monthly';
    case Annual = 'annual';

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Monthly',
            self::Annual => 'Annual',
        };
    }

    /**
     * The recurring interval value accepted by the Stripe Prices API.
     */
    public function stripeInterval(): string
    {
        return match ($this) {
            self::Monthly => 'month',
            self::Annual => 'year',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $interval): array => ['value' => $interval->value, 'label' => $interval->label()],
            self::cases(),
        );
    }
}
