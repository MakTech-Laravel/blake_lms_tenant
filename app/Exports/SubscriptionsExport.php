<?php

namespace App\Exports;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * The Subscription Tracking table as a spreadsheet, honouring whatever filters
 * were applied to the query it is handed.
 */
class SubscriptionsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @param  Builder<Subscription>  $query
     */
    public function __construct(private readonly Builder $query) {}

    /**
     * @return Builder<Subscription>
     */
    public function query(): Builder
    {
        return $this->query;
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['Organization', 'Plan', 'MRR', 'Status', 'Renewal', 'Trial days', 'Trial ends'];
    }

    /**
     * @param  Subscription  $subscription
     * @return array<int, string|int>
     */
    public function map($subscription): array
    {
        $status = SubscriptionStatus::forSubscription($subscription);

        return [
            $subscription->school?->name ?? '—',
            $subscription->plan?->name ?? '—',
            // Only a billable organization contributes revenue, matching the
            // MRR column in the UI.
            $status === SubscriptionStatus::Active
                ? number_format((float) $subscription->monthly_price, 2, '.', '')
                : '0.00',
            $status->label(),
            $subscription->renews_at?->format('Y-m-d') ?? '—',
            (int) $subscription->trial_days,
            $subscription->trial_ends_at?->format('Y-m-d') ?? '—',
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
