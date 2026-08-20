import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { PlanForm } from '@/components/aquacert/plans/plan-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/platform';
import plans from '@/routes/platform/plans';
import subscriptions from '@/routes/platform/subscriptions';

interface EditablePlan {
    id: number;
    slug: string;
    name: string;
    pricing_type: string;
    monthly_price: string | null;
    annual_price: string | null;
    description: string | null;
    staff_limit: number | null;
    location_limit: number | null;
    course_limit: number | null;
    storage_gb: number | null;
    features: string[];
    is_popular: boolean;
    trial_days: number;
    sort_order: number;
    is_active: boolean;
}

interface EditPlanProps {
    plan: EditablePlan;
    pricingOptions: { value: string; label: string }[];
    trialDaysMax: number;
    subscriptionsCount: number;
}

export default function EditPlan({
    plan,
    pricingOptions,
    trialDaysMax,
    subscriptionsCount,
}: EditPlanProps) {
    return (
        <>
            <Head title={`Edit ${plan.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={`Edit ${plan.name}`}
                    subtitle="Update this tier's pricing, limits, features, and availability."
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
                        action={plans.update(plan.slug)}
                        isEdit
                        pricingOptions={pricingOptions}
                        trialDaysMax={trialDaysMax}
                        defaults={plan}
                        subscriptionsCount={subscriptionsCount}
                        onCancel={() => router.visit(subscriptions.index().url)}
                    />
                </Card>
            </div>
        </>
    );
}

EditPlan.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Subscriptions', href: subscriptions.index() },
        { title: 'Edit plan', href: subscriptions.index() },
    ],
};
