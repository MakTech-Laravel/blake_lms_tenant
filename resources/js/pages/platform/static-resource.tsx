import { Head } from '@inertiajs/react';
import { StaticModulePage } from '@/components/aquacert/static-module-page';
import { StatusBadge } from '@/components/aquacert/status-badge';

type Props = {
    title: string;
    subtitle: string;
    columns?: { key: string; label: string }[];
    rows?: Record<string, string | number>[];
};

const defaultColumns = [
    { key: 'name', label: 'Name' },
    { key: 'meta', label: 'Details' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
    { key: 'updated', label: 'Updated' },
];

const defaultRows = [
    {
        name: 'Water Safety Fundamentals',
        meta: 'Core curriculum',
        owner: 'Alex Park',
        status: 'Active',
        updated: '2026-03-01',
    },
    {
        name: 'Lifeguard Pathway',
        meta: '12 modules',
        owner: 'Sam Lee',
        status: 'Active',
        updated: '2026-02-18',
    },
    {
        name: 'Pool Operations Quiz',
        meta: 'Assessment pack',
        owner: 'Jordan Wells',
        status: 'Pending',
        updated: '2026-03-10',
    },
    {
        name: 'Emergency Drill Cert',
        meta: 'Certificate template',
        owner: 'Alex Park',
        status: 'Active',
        updated: '2026-01-22',
    },
];

export default function StaticResourcePage({
    title,
    subtitle,
    columns = defaultColumns,
    rows = defaultRows,
}: Props) {
    return (
        <>
            <Head title={title} />
            <StaticModulePage
                title={title}
                subtitle={subtitle}
                columns={columns}
                rows={rows.map((row) => ({
                    ...row,
                    status: <StatusBadge status={String(row.status)} />,
                }))}
            />
        </>
    );
}
