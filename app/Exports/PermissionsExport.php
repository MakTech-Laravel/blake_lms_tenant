<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Spatie\Permission\Models\Permission;

class PermissionsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return Collection<int, Permission>
     */
    public function collection()
    {
        return Permission::query()
            ->withCount('roles')
            ->orderBy('group')
            ->orderBy('id')
            ->get();
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return ['ID', 'Group', 'Permission', 'Guard', 'Assigned Roles', 'Created At'];
    }

    /**
     * @param  Permission  $permission
     * @return array<int, mixed>
     */
    public function map($permission): array
    {
        return [
            $permission->id,
            $permission->group,
            $permission->name,
            $permission->guard_name,
            $permission->roles_count,
            $permission->created_at?->format('Y-m-d H:i'),
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
