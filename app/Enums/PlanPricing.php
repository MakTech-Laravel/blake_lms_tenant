<?php

namespace App\Enums;

/**
 * How a plan is priced.
 *
 * A Fixed plan carries its own rate and every organization on it pays that
 * rate — it cannot be overridden per organization. A Custom plan has no list
 * price (it is quoted per deal), so the rate must be entered when the plan is
 * assigned.
 */
enum PlanPricing: string
{
    case Fixed = 'fixed';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::Fixed => 'Fixed price',
            self::Custom => 'Custom price',
        };
    }

    /**
     * Short label for table cells and badges.
     */
    public function shortLabel(): string
    {
        return match ($this) {
            self::Fixed => 'Fixed',
            self::Custom => 'Custom',
        };
    }

    /**
     * The caption under the plan name on its card.
     */
    public function cardCaption(): string
    {
        return match ($this) {
            self::Fixed => 'per month',
            self::Custom => 'Custom pricing',
        };
    }

    /**
     * Whether the rate is negotiated per organization rather than set here.
     */
    public function isCustom(): bool
    {
        return $this === self::Custom;
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $pricing): array => ['value' => $pricing->value, 'label' => $pricing->label()],
            self::cases(),
        );
    }
}
