import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { PlanForm } from '@/components/aquacert/plans/plan-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/platform';
import plans from '@/routes/platform/plans';
import subscriptions from '@/routes/platform/subscriptions';

interface CreatePlanProps {
    pricingOptions: { value: string; label: string }[];
    trialDaysMax: number;
}

export default function CreatePlan({
    pricingOptions,
    trialDaysMax,
}: CreatePlanProps) {
    return (
        <>
            <Head title="Create plan" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Create plan"
                    subtitle="Add a subscription tier organizations can be placed on."
                    actions={
                        <Button
                            variant="outline"
                            asChild
                            className="border-navy-100 text-navy-400"
                        >
                            <Link href={subscriptions.index().url}>
                                <ArrowLeft className="size-4" />
                                Back to subscriptions
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    <PlanForm
                        action={plans.store()}
                        pricingOptions={pricingOptions}
                        trialDaysMax={trialDaysMax}
                        onCancel={() => router.visit(subscriptions.index().url)}
                    />
                </Card>
            </div>
        </>
    );
}

CreatePlan.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Subscriptions', href: subscriptions.index() },
        { title: 'Create plan', href: plans.create() },
    ],
};
