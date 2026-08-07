<?php

namespace App\Exports;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PeopleExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @param  Builder<User>  $query
     */
    public function __construct(private readonly Builder $query) {}

    /**
     * @return Builder<User>
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
        return [
            'Name',
            'Email',
            'Organization',
            'Type',
            'Role',
            'Status',
            'Location',
            'Last Login',
        ];
    }

    /**
     * @param  User  $user
     * @return array<int, mixed>
     */
    public function map($user): array
    {
        $organization = $user->type === UserType::PLATFORM
            ? 'AquaCert'
            : ($user->school?->name ?? '—');

        return [
            $user->name,
            $user->email,
            $organization,
            $user->type->label(),
            $user->directoryRoleLabel(),
            $user->status?->label() ?? UserStatus::Active->label(),
            $user->branch?->name ?? '—',
            $user->last_login_at?->format('Y-m-d H:i') ?? '—',
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
