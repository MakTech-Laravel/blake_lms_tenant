<?php

namespace App\Exports;

use App\Models\School;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrganizationsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @param  Builder<School>  $query
     */
    public function __construct(private readonly Builder $query) {}

    /**
     * @return Builder<School>
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
        return ['Organization', 'Slug', 'Region', 'Plan', 'Locations', 'Staff', 'Status', 'MRR', 'Renewal', 'Email', 'Phone'];
    }

    /**
     * @param  School  $school
     * @return array<int, mixed>
     */
    public function map($school): array
    {
        $subscription = $school->subscription;

        return [
            $school->name,
            $school->slug,
            $school->region ?? '—',
            $subscription?->plan?->name ?? '—',
            $school->locations_count,
            $school->staff_count,
            $school->status->label(),
            $school->status->isBillable() ? (string) ($subscription?->monthly_price ?? '0.00') : '0.00',
            optional($subscription?->renews_at)?->format('Y-m-d') ?? '—',
            $school->email ?? '—',
            $school->phone ?? '—',
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
