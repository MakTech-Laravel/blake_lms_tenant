import { Head, Link, router } from '@inertiajs/react';
import { Layers, Plus } from 'lucide-react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { PlanCard } from '@/components/aquacert/subscriptions/plan-card';
import type { TrackingFilters } from '@/components/aquacert/subscriptions/subscription-tracking-table';
import { SubscriptionTrackingTable } from '@/components/aquacert/subscriptions/subscription-tracking-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import plans from '@/routes/platform/plans';
import subscriptions from '@/routes/platform/subscriptions';
import type {
    Paginated,
    PlanCard as PlanCardData,
    SubscriptionStats,
    SubscriptionTrackingRow,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type FilterOption = { value: string; label: string };

interface SubscriptionsIndexProps {
    tab: 'plans' | 'tracking';
    plans: PlanCardData[];
    /** Only sent for the tracking tab, which is the only tab that queries. */
    tracking?: Paginated<SubscriptionTrackingRow>;
    filters?: TrackingFilters;
    stats?: SubscriptionStats;
    planOptions?: FilterOption[];
    statusOptions?: FilterOption[];
}

export default function SubscriptionsIndex({
    tab,
    plans: planCards,
    tracking,
    filters,
    stats,
    planOptions,
    statusOptions,
}: SubscriptionsIndexProps) {
    const { can } = usePermission();

    // The tab lives in the URL so a reload or the back button lands where the
    // user left off, and so a filtered tracking view can be shared as a link.
    const switchTab = (next: string) => {
        if (next === tab) {
            return;
        }

        router.get(
            subscriptions.index().url,
            next === 'tracking' ? { tab: 'tracking' } : {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Subscriptions" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Subscriptions"
                    subtitle="The plans on offer and the organizations subscribed to them."
                    actions={
                        can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.CREATE) ? (
                            <Button
                                asChild
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                <Link href={plans.create().url}>
                                    <Plus className="size-4" />
                                    Create Plan
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <Tabs value={tab} onValueChange={switchTab}>
                    <TabsList
                        variant="line"
                        className="h-auto w-full justify-start gap-6 border-b border-navy-50 pb-1.5"
                    >
                        <TabsTrigger
                            value="plans"
                            className="flex-none px-0 text-body-3 font-semibold text-navy-300 data-[state=active]:text-navy-500 data-[state=active]:after:bg-aqua-500"
                        >
                            Plans
                        </TabsTrigger>
                        <TabsTrigger
                            value="tracking"
                            className="flex-none px-0 text-body-3 font-semibold text-navy-300 data-[state=active]:text-navy-500 data-[state=active]:after:bg-aqua-500"
                        >
                            Subscription Tracking
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="plans" className="mt-6">
                        {planCards.length > 0 ? (
                            <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                {planCards.map((plan) => (
                                    <PlanCard key={plan.id} plan={plan} />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-navy-50 bg-white px-4 py-16 text-center shadow-sm">
                                <Layers className="mx-auto size-10 text-navy-200" />
                                <h3 className="mt-4 text-sm font-semibold text-navy-500">
                                    No plans yet
                                </h3>
                                <p className="mt-1 text-body-4 text-navy-300">
                                    Create a plan to start placing organizations
                                    on a subscription.
                                </p>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="tracking" className="mt-6">
                        {tracking && filters && stats && (
                            <SubscriptionTrackingTable
                                rows={tracking}
                                filters={filters}
                                stats={stats}
                                planOptions={planOptions ?? []}
                                statusOptions={statusOptions ?? []}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

SubscriptionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Subscriptions', href: subscriptions.index() },
    ],
};
