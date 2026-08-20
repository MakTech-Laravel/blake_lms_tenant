<?php

namespace App\Exports;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NotificationsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    /**
     * @param  Builder<Notification>  $query
     */
    public function __construct(private readonly Builder $query) {}

    /**
     * @return Builder<Notification>
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
            'Title', 'Category', 'Priority', 'Audience', 'Channels', 'Status',
            'Scheduled', 'Sent', 'Recipients', 'Read', 'Author', 'Organization', 'Message',
        ];
    }

    /**
     * @param  Notification  $notification
     * @return array<int, mixed>
     */
    public function map($notification): array
    {
        return [
            $notification->title,
            $notification->category->label(),
            $notification->priority->label(),
            $notification->audience_label,
            $notification->channelLabel(),
            $notification->status->label(),
            $notification->scheduled_at?->format('Y-m-d H:i') ?? '—',
            $notification->sent_at?->format('Y-m-d H:i') ?? '—',
            $notification->recipients_count,
            (int) ($notification->read_count ?? 0),
            $notification->sender?->name ?? 'System',
            $notification->school?->name ?? 'Platform',
            $notification->excerpt(500),
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
