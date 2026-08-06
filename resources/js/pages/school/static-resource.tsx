import { Head } from '@inertiajs/react';
import { StaticModulePage } from '@/components/aquacert/static-module-page';
import { StatusBadge } from '@/components/aquacert/status-badge';

type Props = {
    title: string;
    subtitle: string;
};

const rows = [
    { name: 'Water Safety Fundamentals', meta: 'Assigned to 42 staff', owner: 'Kevin Park', status: 'Active', updated: '2026-03-01' },
    { name: 'Harbour View Branch', meta: '12 active instructors', owner: 'Sarah Mitchell', status: 'Active', updated: '2026-02-20' },
    { name: 'Emergency Response Pathway', meta: '8 modules', owner: 'Daniel Cho', status: 'In Progress', updated: '2026-03-08' },
    { name: 'Monthly Compliance Report', meta: 'Export ready', owner: 'Kevin Park', status: 'Completed', updated: '2026-03-11' },
];

export default function SchoolStaticResource({ title, subtitle }: Props) {
    return (
        <>
            <Head title={title} />
            <StaticModulePage
                title={title}
                subtitle={subtitle}
                columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'meta', label: 'Details' },
                    { key: 'owner', label: 'Owner' },
                    { key: 'status', label: 'Status' },
                    { key: 'updated', label: 'Updated' },
                ]}
                rows={rows.map((row) => ({
                    ...row,
                    status: <StatusBadge status={row.status} />,
                }))}
            />
        </>
    );
}
