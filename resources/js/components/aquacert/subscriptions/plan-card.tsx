import { Link, router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Building2,
    Check,
    Copy,
    Pencil,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import plans from '@/routes/platform/plans';
import type { PlanCard as PlanCardData } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

/**
 * Icons are positional rather than stored: the catalog is a short ordered list
 * that reads entry-level to enterprise, so the tier's place in it is enough.
 * Keeps an icon column and a picker out of the plan editor.
 */
const TIER_ICONS = [Zap, Sparkles, Building2];

interface PlanCardProps {
    plan: PlanCardData;
}

export function PlanCard({ plan }: PlanCardProps) {
    const { can } = usePermission();
    const [confirmingArchive, setConfirmingArchive] = useState(false);

    const Icon = TIER_ICONS[plan.sort_order % TIER_ICONS.length];
    const canEdit = can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.EDIT);
    const canCreate = can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.CREATE);
    const canDelete = can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.DELETE);

    return (
        <>
            <Card
                className={cn(
                    'relative flex flex-col gap-0 overflow-hidden p-0 shadow-sm transition-shadow hover:shadow-md',
                    plan.is_popular
                        ? 'border-navy-500 ring-1 ring-navy-500'
                        : 'border-navy-50',
                    plan.is_archived && 'opacity-70',
                )}
            >
                {plan.is_popular && (
                    <p className="bg-navy-500 py-1.5 text-center text-caption-1 font-bold tracking-widest text-white uppercase">
                        Most popular
                    </p>
                )}

                <div className="flex flex-1 flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2.5">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-aqua-50 text-aqua-600">
                                <Icon className="size-4.5" />
                            </span>
                            <span>
                                <span className="block text-h6 font-semibold text-navy-500">
                                    {plan.name}
                                </span>
                                {plan.pricing_type === 'custom' && (
                                    <span className="block text-body-4 text-navy-300">
                                        {plan.price_caption}
                                    </span>
                                )}
                            </span>
                        </span>
                        {plan.status !== 'Active' && (
                            <StatusBadge status={plan.status} />
                        )}
                    </div>

                    {plan.description && (
                        <p className="text-body-4 text-navy-300">
                            {plan.description}
                        </p>
                    )}

                    <div>
                        <p className="flex items-baseline gap-1.5">
                            <span className="text-h3 font-bold text-navy-500">
                                {plan.price_headline}
                            </span>
                            {plan.pricing_type === 'fixed' && (
                                <span className="text-body-4 text-navy-300">
                                    /month
                                </span>
                            )}
                        </p>
                        <p className="mt-1 text-xs text-navy-300">
                            {plan.annual_price_label
                                ? `${plan.annual_price_label} · ${plan.trial_label}`
                                : plan.pricing_type === 'custom'
                                  ? `Custom pricing for your organization · ${plan.trial_label}`
                                  : plan.trial_label}
                        </p>
                    </div>

                    {plan.limit_badges.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5">
                            {plan.limit_badges.map((badge) => (
                                <li
                                    key={badge}
                                    className="rounded-full bg-navy-50 px-2.5 py-0.5 text-caption-1 font-medium text-navy-400"
                                >
                                    {badge}
                                </li>
                            ))}
                        </ul>
                    )}

                    {plan.features.length > 0 && (
                        <ul className="flex flex-1 flex-col gap-2 border-t border-navy-50 pt-5">
                            {plan.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2 text-body-4 text-navy-500"
                                >
                                    <Check className="mt-0.5 size-3.5 shrink-0 text-aqua-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs text-navy-300">
                        {plan.organizations_count === 0 ? (
                            'No organizations yet'
                        ) : (
                            <Link
                                href={plan.organizations_url}
                                className="font-medium text-aqua-600 hover:underline"
                            >
                                {plan.organizations_count} active{' '}
                                {plan.organizations_count === 1
                                    ? 'subscriber'
                                    : 'subscribers'}
                            </Link>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-navy-50 border-t border-navy-50">
                    {plan.is_archived ? (
                        <Button
                            variant="ghost"
                            disabled={!canEdit}
                            onClick={() =>
                                router.patch(
                                    plans.restore(plan.slug).url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className="col-span-2 rounded-none py-5 text-navy-400 hover:bg-aqua-50/60 hover:text-navy-500"
                        >
                            <ArchiveRestore className="size-4" />
                            Restore
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                asChild={canEdit}
                                disabled={!canEdit}
                                className="rounded-none py-5 text-navy-400 hover:bg-aqua-50/60 hover:text-navy-500"
                            >
                                {canEdit ? (
                                    <Link href={plan.edit_url}>
                                        <Pencil className="size-4" />
                                        Edit
                                    </Link>
                                ) : (
                                    <span>
                                        <Pencil className="size-4" />
                                        Edit
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={!canCreate}
                                onClick={() =>
                                    router.post(
                                        plans.duplicate(plan.slug).url,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className="rounded-none py-5 text-navy-400 hover:bg-aqua-50/60 hover:text-navy-500"
                            >
                                <Copy className="size-4" />
                                Duplicate
                            </Button>
                        </>
                    )}
                </div>

                {canDelete && !plan.is_archived && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmingArchive(true)}
                        aria-label={`Archive ${plan.name}`}
                        className={cn(
                            'absolute right-3 size-8 text-navy-200 hover:bg-red-50 hover:text-red-600',
                            // Clear the ribbon when the card is wearing one.
                            plan.is_popular ? 'top-10' : 'top-3',
                        )}
                    >
                        <Archive className="size-4" />
                    </Button>
                )}
            </Card>

            <ConfirmDeleteDialog
                open={confirmingArchive}
                onOpenChange={setConfirmingArchive}
                title="Archive this plan?"
                confirmLabel="Archive"
                description={
                    <>
                        Archive <strong>{plan.name}</strong>? It stops being
                        offered to new organizations.{' '}
                        {plan.organizations_count > 0
                            ? `The ${plan.organizations_count} organization${plan.organizations_count === 1 ? '' : 's'} already on it keep their current rate.`
                            : 'You can restore it at any time.'}
                    </>
                }
                onConfirm={() =>
                    router.delete(plans.destroy(plan.slug).url, {
                        preserveScroll: true,
                    })
                }
            />
        </>
    );
}
