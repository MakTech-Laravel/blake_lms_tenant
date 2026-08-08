import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarClock,
    CreditCard,
    Globe,
    Mail,
    MapPin,
    Pencil,
    Phone,
    ShieldCheck,
    ShieldOff,
    Trash2,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { SectionCard } from '@/components/aquacert/section-card';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { dashboard } from '@/routes/platform';
import organizations from '@/routes/platform/organizations';
import type {
    OrganizationLocation,
    OrganizationStaffMember,
    OrganizationSubscription,
    OrganizationSummary,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type OrganizationShowProps = {
    organization: OrganizationSummary;
    subscription: OrganizationSubscription | null;
    locations: OrganizationLocation[];
    staff: OrganizationStaffMember[];
};

/** Radix's default thumb uses the border token, which is near-invisible on white. */
const SCROLL_THUMB = '[&_[data-orientation=vertical]>div]:bg-navy-100';

function DetailRow({
    label,
    children,
    icon: Icon,
}: {
    label: string;
    children: ReactNode;
    icon?: typeof Users;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-navy-50 py-2.5 last:border-0">
            <span className="flex items-center gap-2 text-body-3 text-navy-300">
                {Icon && <Icon className="size-4 text-navy-200" />}
                {label}
            </span>
            <span className="text-right text-body-3 font-medium break-words text-navy-500">
                {children}
            </span>
        </div>
    );
}

export default function OrganizationShow({
    organization,
    subscription,
    locations,
    staff,
}: OrganizationShowProps) {
    const { can } = usePermission();
    const isSuspended = organization.status_value === 'suspended';

    const toggleStatus = () => {
        router.patch(
            organizations.status(organization.slug).url,
            { status: isSuspended ? 'active' : 'suspended' },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={organization.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={organization.name}
                    subtitle={`${organization.region} · ${subscription?.plan ?? 'No plan'}`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="border-navy-100 text-navy-400"
                            >
                                <Link href={organizations.index().url}>
                                    <ArrowLeft className="size-4" />
                                    Back to organizations
                                </Link>
                            </Button>

                            {can(PERMISSIONS.SCHOOLS.EDIT) && (
                                <Button
                                    variant="outline"
                                    onClick={toggleStatus}
                                    className="border-navy-100 text-navy-400"
                                >
                                    {isSuspended ? (
                                        <ShieldCheck className="size-4" />
                                    ) : (
                                        <ShieldOff className="size-4" />
                                    )}
                                    {isSuspended ? 'Activate' : 'Suspend'}
                                </Button>
                            )}

                            {can(PERMISSIONS.SCHOOLS.DELETE) && (
                                <ConfirmDeleteDialog
                                    description={
                                        <>
                                            Delete{' '}
                                            <strong>
                                                {organization.name}
                                            </strong>
                                            ? Its staff and locations must be
                                            removed first.
                                        </>
                                    }
                                    onConfirm={() =>
                                        router.delete(
                                            organizations.destroy(
                                                organization.slug,
                                            ).url,
                                        )
                                    }
                                >
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="size-4" />
                                        Delete
                                    </Button>
                                </ConfirmDeleteDialog>
                            )}

                            {can(PERMISSIONS.SCHOOLS.EDIT) && (
                                <Button
                                    asChild
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Link
                                        href={
                                            organizations.edit(
                                                organization.slug,
                                            ).url
                                        }
                                    >
                                        <Pencil className="size-4" />
                                        Edit Organization
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AquaStatCard
                        label="Locations"
                        value={organization.locations_count}
                        icon={MapPin}
                    />
                    <AquaStatCard
                        label="Staff"
                        value={organization.staff_count}
                        icon={Users}
                    />
                    <AquaStatCard
                        label="Monthly Recurring"
                        value={subscription?.mrr_label ?? '$0'}
                        icon={CreditCard}
                    />
                    <AquaStatCard
                        label="Plan"
                        value={subscription?.plan ?? 'No plan'}
                        icon={Building2}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6">
                        <SectionCard title="Organization Summary">
                            <div className="flex flex-col items-center gap-3 pb-4 text-center">
                                <span className="flex size-16 items-center justify-center rounded-2xl bg-navy-500 text-h6 font-bold text-white">
                                    {organization.initials}
                                </span>
                                <div>
                                    <p className="text-h6 font-semibold text-navy-500">
                                        {organization.name}
                                    </p>
                                    <p className="font-mono text-body-4 text-navy-300">
                                        {organization.slug}
                                    </p>
                                </div>
                                <StatusBadge status={organization.status} />
                            </div>

                            <div className="border-t border-navy-50 pt-2">
                                <DetailRow label="Region" icon={Globe}>
                                    {organization.region}
                                </DetailRow>
                                <DetailRow label="Email" icon={Mail}>
                                    {organization.email}
                                </DetailRow>
                                <DetailRow label="Phone" icon={Phone}>
                                    {organization.phone}
                                </DetailRow>
                                <DetailRow label="Address" icon={MapPin}>
                                    {organization.address}
                                </DetailRow>
                                <DetailRow label="Courses">
                                    {organization.courses_count}
                                </DetailRow>
                                <DetailRow label="Created">
                                    {organization.created_label}
                                </DetailRow>
                                <DetailRow
                                    label="Last updated"
                                    icon={CalendarClock}
                                >
                                    {organization.updated_relative}
                                </DetailRow>
                            </div>

                            {isSuspended && (
                                <p className="mt-4 rounded-lg border border-red-200 bg-red-50/60 p-3 text-body-4 text-red-700">
                                    This organization is suspended. Its staff
                                    cannot sign in to the school dashboard until
                                    it is reactivated.
                                </p>
                            )}
                        </SectionCard>

                        <SectionCard title="Subscription">
                            {subscription === null ? (
                                <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
                                    No subscription on this organization yet.
                                </p>
                            ) : (
                                <>
                                    <DetailRow label="Plan">
                                        <span className="flex items-center gap-2">
                                            {subscription.plan}
                                            <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-400">
                                                {subscription.pricing_label}
                                            </span>
                                        </span>
                                    </DetailRow>
                                    <DetailRow label="Agreed rate">
                                        {subscription.monthly_price_label} /
                                        month
                                    </DetailRow>
                                    <DetailRow label="Counted as MRR">
                                        {subscription.mrr_label}
                                    </DetailRow>
                                    <DetailRow label="Free trial">
                                        {subscription.trial_label}
                                    </DetailRow>
                                    {subscription.trial_days > 0 && (
                                        <DetailRow label="Trial ends">
                                            {subscription.trial_ends_label}
                                        </DetailRow>
                                    )}
                                    <DetailRow
                                        label="Renews"
                                        icon={CalendarClock}
                                    >
                                        {subscription.renewal_label}
                                    </DetailRow>

                                    {subscription.plan_description && (
                                        <p className="mt-4 text-body-4 text-navy-300">
                                            {subscription.plan_description}
                                        </p>
                                    )}

                                    {!subscription.is_billable && (
                                        <p className="mt-4 rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-body-4 text-orange-700">
                                            Only active organizations contribute
                                            to platform MRR, so this
                                            subscription is currently counted as
                                            $0.
                                        </p>
                                    )}
                                </>
                            )}
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <SectionCard
                            title="Locations"
                            action={
                                <span className="text-body-4 text-navy-300">
                                    {organization.locations_count} total
                                </span>
                            }
                        >
                            {locations.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
                                    This organization has no locations yet.
                                </p>
                            ) : (
                                <ScrollArea
                                    type="auto"
                                    className={cn(
                                        'max-h-80 w-full',
                                        SCROLL_THUMB,
                                    )}
                                >
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10">
                                            <TableRow className="border-navy-50 bg-aqua-50 hover:bg-aqua-50">
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Location
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Staff
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {locations.map((location) => (
                                                <TableRow
                                                    key={location.id}
                                                    className="border-navy-50"
                                                >
                                                    <TableCell>
                                                        <span className="block font-semibold text-navy-500">
                                                            {location.name}
                                                        </span>
                                                        <span className="block text-body-4 text-navy-300">
                                                            {location.address}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-body-3 text-navy-500 tabular-nums">
                                                        {location.staff_count}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={
                                                                location.status
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Staff"
                            action={
                                <span className="text-body-4 text-navy-300">
                                    {staff.length === organization.staff_count
                                        ? `${organization.staff_count} total`
                                        : `Showing ${staff.length} of ${organization.staff_count}`}
                                </span>
                            }
                        >
                            {staff.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
                                    No staff accounts at this organization yet.
                                </p>
                            ) : (
                                <ScrollArea
                                    type="auto"
                                    className={cn(
                                        'max-h-96 w-full',
                                        SCROLL_THUMB,
                                    )}
                                >
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10">
                                            <TableRow className="border-navy-50 bg-aqua-50 hover:bg-aqua-50">
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Staff member
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Location
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {staff.map((member) => (
                                                <TableRow
                                                    key={member.id}
                                                    className="border-navy-50"
                                                >
                                                    <TableCell>
                                                        <Link
                                                            href={
                                                                member.profile_url
                                                            }
                                                            className="flex items-center gap-3"
                                                        >
                                                            <Avatar className="size-9 bg-aqua-50">
                                                                {member.avatar_url && (
                                                                    <AvatarImage
                                                                        src={
                                                                            member.avatar_url
                                                                        }
                                                                        alt={
                                                                            member.name
                                                                        }
                                                                    />
                                                                )}
                                                                <AvatarFallback className="bg-aqua-50 text-caption-1 font-semibold text-aqua-700">
                                                                    {
                                                                        member.initials
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                                <span className="block font-semibold text-navy-500">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </span>
                                                                <span className="block text-body-4 text-navy-300">
                                                                    {
                                                                        member.email
                                                                    }
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-body-3 font-medium text-aqua-600">
                                                        {member.branch}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={
                                                                member.status
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </SectionCard>
                    </div>
                </div>
            </div>
        </>
    );
}

OrganizationShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Organizations', href: organizations.index() },
        { title: 'Details', href: organizations.index() },
    ],
};
