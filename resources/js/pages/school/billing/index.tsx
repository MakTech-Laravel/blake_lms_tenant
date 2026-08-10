import { Head, router, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Download,
    FileSpreadsheet,
    RotateCcw,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { PERMISSIONS } from '@/types/permissions';

type IntervalOption = { value: string; label: string };

type BillingPlan = {
    id: number;
    name: string;
    description: string;
    pricing_type: string;
    price_headline: string;
    annual_price_label: string | null;
    trial_label: string;
    features: string[];
    is_popular: boolean;
    has_monthly_price: boolean;
    has_annual_price: boolean;
};

type BillingSubscription = {
    plan_id: number;
    plan_name: string | null;
    pricing_type: string | null;
    monthly_price: string;
    mrr_label: string;
    billing_interval: string;
    billing_interval_label: string;
    trial_days: number;
    trial_label: string | null;
    renewal_label: string;
    stripe_status: string | null;
    status_label: string;
    on_stripe: boolean;
    on_grace_period: boolean;
};

type BillingInvoice = {
    id: string;
    number: string | null;
    date: string;
    total: string;
    status: string;
    download_url: string;
};

type PaymentMethod = {
    type: string;
    last_four: string | null;
};

interface SchoolBillingProps {
    subscription: BillingSubscription | null;
    availablePlans: BillingPlan[];
    intervalOptions: IntervalOption[];
    invoices: BillingInvoice[];
    paymentMethod: PaymentMethod | null;
    checkoutStatus?: string | null;
}

export default function SchoolBillingPage({
    subscription,
    availablePlans,
    intervalOptions,
    invoices,
    paymentMethod,
    checkoutStatus,
}: SchoolBillingProps) {
    const { can } = usePermission();
    const school = usePage().props.school;
    const canManage = can(PERMISSIONS.SCHOOL_BILLING.MANAGE);
    const canDownload = can(PERMISSIONS.SCHOOL_BILLING.INVOICE_DOWNLOAD);
    const canExport = can(PERMISSIONS.SCHOOL_BILLING.EXPORT);

    const [interval, setInterval] = useState(
        subscription?.billing_interval ?? intervalOptions[0]?.value ?? 'monthly',
    );
    const [working, setWorking] = useState(false);

    const billingBase = school ? `/school/${school.slug}/billing` : '/billing';

    const startCheckout = (planId: number) => {
        setWorking(true);
        router.post(
            `${billingBase}/checkout`,
            { plan_id: planId, interval },
            { onFinish: () => setWorking(false) },
        );
    };

    const openPortal = () => {
        setWorking(true);
        router.get(`${billingBase}/portal`, {}, { onFinish: () => setWorking(false) });
    };

    const cancel = () => {
        setWorking(true);
        router.patch(
            `${billingBase}/cancel`,
            {},
            { preserveScroll: true, onFinish: () => setWorking(false) },
        );
    };

    const resume = () => {
        setWorking(true);
        router.patch(
            `${billingBase}/resume`,
            {},
            { preserveScroll: true, onFinish: () => setWorking(false) },
        );
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Subscription & Billing" />

            <AquaPageHeader
                title="Subscription & Billing"
                subtitle="Your plan, payment method, and invoices"
                actions={
                    <div className="flex flex-wrap gap-2">
                        {canExport && (
                            <Button variant="outline" asChild>
                                <a href={`${billingBase}/export`}>
                                    <FileSpreadsheet className="size-4" />
                                    Export invoices
                                </a>
                            </Button>
                        )}
                        {canManage && subscription?.on_stripe && (
                            <Button
                                type="button"
                                disabled={working}
                                onClick={openPortal}
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                <CreditCard className="size-4" />
                                Billing portal
                            </Button>
                        )}
                    </div>
                }
            />

            {checkoutStatus === 'success' && (
                <Card className="border-aqua-200 bg-aqua-50 p-4 text-body-3 text-navy-500">
                    Payment received. Stripe may take a moment to confirm — this
                    page will update when the webhook lands.
                </Card>
            )}

            {checkoutStatus === 'cancel' && (
                <Card className="border-amber-200 bg-amber-50 p-4 text-body-3 text-navy-500">
                    Checkout was cancelled. No charge was made.
                </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AquaStatCard
                    label="Plan"
                    value={subscription?.plan_name ?? 'None'}
                />
                <AquaStatCard
                    label="MRR"
                    value={subscription?.mrr_label ?? '$0'}
                />
                <AquaStatCard
                    label="Status"
                    value={subscription?.status_label ?? '—'}
                />
                <AquaStatCard
                    label="Renewal"
                    value={subscription?.renewal_label ?? '—'}
                />
            </div>

            {subscription && (
                <Card className="gap-4 border-navy-50 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-h6 font-semibold text-navy-500">
                                Current agreement
                            </h2>
                            <p className="mt-1 text-body-4 text-navy-300">
                                {subscription.billing_interval_label}
                                {subscription.stripe_status
                                    ? ` · Stripe: ${subscription.stripe_status}`
                                    : ' · Not yet on Stripe'}
                                {paymentMethod?.last_four
                                    ? ` · Card ending ${paymentMethod.last_four}`
                                    : ''}
                            </p>
                        </div>
                        <StatusBadge status={subscription.status_label} />
                    </div>

                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            {!subscription.on_stripe && (
                                <Button
                                    type="button"
                                    disabled={working}
                                    onClick={() =>
                                        startCheckout(subscription.plan_id)
                                    }
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Sparkles className="size-4" />
                                    Start checkout
                                </Button>
                            )}
                            {subscription.on_stripe &&
                                !subscription.on_grace_period && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={working}
                                        onClick={cancel}
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        Cancel at period end
                                    </Button>
                                )}
                            {subscription.on_grace_period && (
                                <Button
                                    type="button"
                                    disabled={working}
                                    onClick={resume}
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <RotateCcw className="size-4" />
                                    Resume subscription
                                </Button>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {canManage && availablePlans.length > 0 && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-h6 font-semibold text-navy-500">
                                Choose a plan
                            </h2>
                            <p className="mt-1 text-body-4 text-navy-300">
                                Fixed plans can be started here. Custom plans
                                only appear after the platform assigns a rate.
                            </p>
                        </div>
                        <div className="flex gap-1 rounded-lg border border-navy-100 bg-white p-1">
                            {intervalOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setInterval(option.value)}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-label-3 font-medium transition-colors',
                                        interval === option.value
                                            ? 'bg-navy-500 text-white'
                                            : 'text-navy-400 hover:text-navy-500',
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {availablePlans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={cn(
                                    'flex flex-col gap-4 border-navy-50 bg-white p-5 shadow-sm',
                                    plan.is_popular && 'ring-2 ring-aqua-400',
                                )}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-label-1 font-semibold text-navy-500">
                                            {plan.name}
                                        </h3>
                                        {plan.is_popular && (
                                            <Badge className="bg-aqua-500 text-white">
                                                Popular
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-body-4 text-navy-300">
                                        {plan.description}
                                    </p>
                                </div>
                                <p className="text-h5 font-semibold text-navy-500">
                                    {interval === 'annual' &&
                                    plan.annual_price_label
                                        ? plan.annual_price_label
                                        : plan.price_headline}
                                </p>
                                <p className="text-caption-1 text-aqua-700">
                                    {plan.trial_label}
                                </p>
                                <ul className="space-y-1.5 text-body-4 text-navy-400">
                                    {plan.features.slice(0, 4).map((feature) => (
                                        <li key={feature}>• {feature}</li>
                                    ))}
                                </ul>
                                <Button
                                    type="button"
                                    disabled={working}
                                    onClick={() => startCheckout(plan.id)}
                                    className="mt-auto bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    {subscription?.plan_id === plan.id
                                        ? 'Checkout this plan'
                                        : 'Select & checkout'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            <Card className="gap-0 overflow-hidden border-navy-50 bg-white p-0 shadow-sm">
                <div className="border-b border-navy-50 px-5 py-4">
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Invoices
                    </h2>
                    <p className="mt-1 text-body-4 text-navy-300">
                        Recent billing history from Stripe
                    </p>
                </div>

                {invoices.length === 0 ? (
                    <div className="px-5 py-12 text-center text-body-4 text-navy-300">
                        No invoices yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-navy-50 hover:bg-transparent">
                                <TableHead>Invoice</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow
                                    key={invoice.id}
                                    className="border-navy-50"
                                >
                                    <TableCell className="font-medium text-navy-500">
                                        {invoice.number ?? invoice.id}
                                    </TableCell>
                                    <TableCell className="text-navy-400 tabular-nums">
                                        {invoice.date}
                                    </TableCell>
                                    <TableCell className="font-semibold text-navy-500 tabular-nums">
                                        {invoice.total}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={invoice.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canDownload && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <a href={invoice.download_url}>
                                                    <Download className="size-4" />
                                                    PDF
                                                </a>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
