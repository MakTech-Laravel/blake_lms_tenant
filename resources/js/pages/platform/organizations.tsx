import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { StaticModulePage } from '@/components/aquacert/static-module-page';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { platformOverview } from '@/data/aquacert-fixtures';

export default function Organizations() {
    return (
        <>
            <Head title="Organizations" />
            <StaticModulePage
                title="Organizations"
                subtitle={`Managing ${platformOverview.organizations.length} swim school organizations`}
                searchPlaceholder="Search organizations..."
                actions={
                    <Button className="bg-navy-500 text-white hover:bg-navy-600">
                        <Plus className="size-4" />
                        Create Organization
                    </Button>
                }
                columns={[
                    { key: 'name', label: 'Organization' },
                    { key: 'plan', label: 'Plan' },
                    { key: 'locations', label: 'Locations' },
                    { key: 'staff', label: 'Staff' },
                    { key: 'status', label: 'Status' },
                    { key: 'renewal', label: 'Renewal' },
                ]}
                rows={platformOverview.organizations.map((org) => ({
                    name: (
                        <div>
                            <p className="font-semibold text-navy-500">{org.name}</p>
                            <p className="text-body-4 text-navy-300">{org.region}</p>
                        </div>
                    ),
                    plan: org.plan,
                    locations: org.locations,
                    staff: org.staff,
                    status: <StatusBadge status={org.status} />,
                    renewal: org.renewal,
                }))}
            />
        </>
    );
}
