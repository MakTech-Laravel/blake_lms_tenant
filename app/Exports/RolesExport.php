<?php

namespace App\Exports;

use App\Enums\RoleEnum;
use App\Support\PlatformTeamResolver;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Spatie\Permission\Models\Role;

class RolesExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @param  Builder<Role>  $query
     */
    public function __construct(private readonly Builder $query) {}

    /**
     * @return Builder<Role>
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
        return ['Role', 'Users', 'Permissions', 'Scope', 'Updated At'];
    }

    /**
     * @param  Role  $role
     * @return array<int, mixed>
     */
    public function map($role): array
    {
        $isSuper = $role->name === RoleEnum::SUPER_ADMIN->value;

        return [
            $role->name,
            $role->users_count,
            $isSuper ? 'All' : $role->permissions_count,
            $role->school_id === PlatformTeamResolver::PLATFORM_TEAM_ID ? 'Global' : 'School',
            optional($role->updated_at)?->format('Y-m-d') ?? '—',
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
