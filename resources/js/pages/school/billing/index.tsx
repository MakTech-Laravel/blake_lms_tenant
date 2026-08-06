import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolBilling } from '@/data/modules/school-modules';

export default function SchoolBillingPage() {
    return (
        <div className="flex h-full flex-1 flex-col">
            <div className="space-y-6 p-4 pb-0 md:p-6 md:pb-0">
                <AquaPageHeader
                    title={schoolBilling.title}
                    subtitle={schoolBilling.subtitle}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <AquaStatCard label="Plan" value={schoolBilling.plan.name} />
                    <AquaStatCard label="MRR" value={schoolBilling.plan.mrr} />
                    <AquaStatCard
                        label="Seats"
                        value={`${schoolBilling.plan.used}/${schoolBilling.plan.seats}`}
                    />
                    <AquaStatCard
                        label="Renewal"
                        value={schoolBilling.plan.renewal}
                    />
                </div>
            </div>
            <ModuleFixturePage
                title="Invoices"
                subtitle="Recent billing history"
                columns={schoolBilling.columns}
                rows={schoolBilling.rows}
                createLabel="Download Statement"
            />
        </div>
    );
}
