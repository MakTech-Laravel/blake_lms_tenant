import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Award,
    Ban,
    BookOpen,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleCheck,
    Clock,
    Fingerprint,
    Mail,
    MapPin,
    Pencil,
    Phone,
    ShieldCheck,
    Trash2,
    UserCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import type {
    DirectoryPerson,
    PersonAccess,
    PersonAccount,
    PersonLearning,
    PersonOrganization,
    PersonSession,
} from '@/components/aquacert/people/types';
import { SectionCard } from '@/components/aquacert/section-card';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import people from '@/routes/platform/people';
import { PERMISSIONS } from '@/types/permissions';

type PersonShowProps = {
    person: DirectoryPerson;
    account: PersonAccount;
    organization: PersonOrganization;
    access: PersonAccess;
    learning: PersonLearning;
    sessions: PersonSession[];
};

function DetailRow({
    label,
    children,
    icon: Icon,
}: {
    label: string;
    children: ReactNode;
    icon?: typeof Mail;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-navy-50 py-2.5 last:border-0">
            <span className="flex items-center gap-2 text-body-3 text-navy-300">
                {Icon && <Icon className="size-4 text-navy-200" />}
                {label}
            </span>
            <span className="text-right text-body-3 font-medium text-navy-500">
                {children}
            </span>
        </div>
    );
}

function EmptyHint({ children }: { children: ReactNode }) {
    return (
        <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
            {children}
        </p>
    );
}

export default function PersonShow({
    person,
    account,
    organization,
    access,
    learning,
    sessions,
}: PersonShowProps) {
    const { can } = usePermission();
    const statusUrl = `/platform/directory-users/${person.id}/status`;
    const isDisabled = person.status === 'Disabled';

    const changeStatus = (status: 'active' | 'disabled') => {
        router.patch(statusUrl, { status }, { preserveScroll: true });
    };

    return (
        <>
            <Head title={person.name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={person.name}
                    subtitle={`${account.user_type_label} · ${person.role}`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="border-navy-100 text-navy-400"
                            >
                                <Link href={people.index().url}>
                                    <ArrowLeft className="size-4" />
                                    Back to People
                                </Link>
                            </Button>

                            {can(PERMISSIONS.USERS.EDIT) && !isDisabled && (
                                <Button
                                    variant="outline"
                                    className="border-navy-100 text-navy-400"
                                    onClick={() => changeStatus('disabled')}
                                >
                                    <Ban className="size-4" />
                                    Disable
                                </Button>
                            )}

                            {can(PERMISSIONS.USERS.EDIT) && isDisabled && (
                                <Button
                                    variant="outline"
                                    className="border-navy-100 text-navy-400"
                                    onClick={() => changeStatus('active')}
                                >
                                    <CircleCheck className="size-4" />
                                    Activate
                                </Button>
                            )}

                            {person.can_delete && (
                                <ConfirmDeleteDialog
                                    description={
                                        <>
                                            Delete{' '}
                                            <strong>{person.name}</strong>? This
                                            permanently removes the account and
                                            cannot be undone.
                                        </>
                                    }
                                    onConfirm={() =>
                                        router.delete(
                                            `/platform/directory-users/${person.id}?from=profile`,
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

                            {person.edit_url && can(PERMISSIONS.USERS.EDIT) && (
                                <Button
                                    asChild
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Link href={person.edit_url}>
                                        <Pencil className="size-4" />
                                        Edit User
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                {learning.applicable ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <AquaStatCard
                            label="Enrolled Courses"
                            value={learning.stats.enrolled}
                            icon={BookOpen}
                        />
                        <AquaStatCard
                            label="In Progress"
                            value={learning.stats.in_progress}
                            icon={Clock}
                        />
                        <AquaStatCard
                            label="Completed"
                            value={learning.stats.completed}
                            icon={CheckCircle2}
                            className="[&_span]:bg-emerald-50 [&_span]:text-emerald-600"
                        />
                        <AquaStatCard
                            label="Certificates"
                            value={learning.stats.certificates}
                            icon={Award}
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <AquaStatCard
                            label="Assigned Roles"
                            value={access.roles.length}
                            icon={ShieldCheck}
                        />
                        <AquaStatCard
                            label="Effective Permissions"
                            value={
                                access.has_all_permissions
                                    ? 'All'
                                    : access.permission_count
                            }
                            icon={Fingerprint}
                        />
                        <AquaStatCard
                            label="Email Verified"
                            value={account.email_verified ? 'Yes' : 'No'}
                            icon={UserCheck}
                            className={
                                account.email_verified
                                    ? '[&_span]:bg-emerald-50 [&_span]:text-emerald-600'
                                    : '[&_span]:bg-amber-50 [&_span]:text-amber-600'
                            }
                        />
                        <AquaStatCard
                            label="Two-Factor Auth"
                            value={account.two_factor_enabled ? 'On' : 'Off'}
                            icon={ShieldCheck}
                            className={
                                account.two_factor_enabled
                                    ? '[&_span]:bg-emerald-50 [&_span]:text-emerald-600'
                                    : '[&_span]:bg-red-50 [&_span]:text-red-600'
                            }
                        />
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6">
                        <SectionCard title="Profile">
                            <div className="flex flex-col items-center gap-3 pb-4 text-center">
                                <Avatar className="size-20 bg-aqua-50">
                                    {person.avatar_url && (
                                        <AvatarImage
                                            src={person.avatar_url}
                                            alt={person.name}
                                        />
                                    )}
                                    <AvatarFallback className="bg-aqua-50 text-h6 font-semibold text-aqua-700">
                                        {person.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-h6 font-semibold text-navy-500">
                                        {person.name}
                                    </p>
                                    <p className="text-body-3 text-navy-300">
                                        {person.email}
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <StatusBadge status={person.status} />
                                    <Badge
                                        variant="outline"
                                        className="border-aqua-200 bg-aqua-50 text-caption-1 font-semibold text-aqua-700"
                                    >
                                        {account.user_type_label}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-navy-100 bg-navy-50 text-caption-1 font-semibold text-navy-400"
                                    >
                                        {person.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t border-navy-50 pt-2">
                                <DetailRow label="User ID">
                                    #{account.user_id}
                                </DetailRow>
                                <DetailRow label="Joined" icon={CalendarDays}>
                                    {account.joined_label}
                                </DetailRow>
                                <DetailRow label="Last updated">
                                    {account.updated_label}
                                </DetailRow>
                            </div>
                        </SectionCard>

                        <SectionCard title="Organization & Location">
                            <div className="pt-1">
                                <DetailRow
                                    label="Organization"
                                    icon={Building2}
                                >
                                    {organization.name}
                                </DetailRow>
                                <DetailRow label="Location" icon={MapPin}>
                                    {organization.branch_name ??
                                        (organization.is_head_office
                                            ? 'Head office'
                                            : '—')}
                                </DetailRow>
                                {organization.email && (
                                    <DetailRow label="Org email" icon={Mail}>
                                        {organization.email}
                                    </DetailRow>
                                )}
                                {organization.phone && (
                                    <DetailRow label="Org phone" icon={Phone}>
                                        {organization.phone}
                                    </DetailRow>
                                )}
                                {organization.address && (
                                    <DetailRow label="Address">
                                        {organization.address}
                                    </DetailRow>
                                )}
                                {organization.branch_phone && (
                                    <DetailRow
                                        label="Location phone"
                                        icon={Phone}
                                    >
                                        {organization.branch_phone}
                                    </DetailRow>
                                )}
                                {organization.branch_address && (
                                    <DetailRow label="Location address">
                                        {organization.branch_address}
                                    </DetailRow>
                                )}
                            </div>
                        </SectionCard>

                        <SectionCard title="Active Sessions">
                            {sessions.length === 0 ? (
                                <EmptyHint>No active sessions.</EmptyHint>
                            ) : (
                                <ul className="space-y-3">
                                    {sessions.map((session) => (
                                        <li
                                            key={session.id}
                                            className="rounded-lg border border-navy-50 bg-navy-50/40 p-3"
                                        >
                                            <p className="text-body-3 font-medium text-navy-500">
                                                {session.device}
                                            </p>
                                            <p className="mt-0.5 text-caption-1 text-navy-300">
                                                {session.ip_address} ·{' '}
                                                {session.last_active_label}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <SectionCard title="Account & Security">
                            <div className="grid gap-x-8 pt-1 sm:grid-cols-2">
                                <DetailRow label="Email" icon={Mail}>
                                    {account.email}
                                </DetailRow>
                                <DetailRow label="Email verified">
                                    {account.email_verified ? (
                                        <span className="text-emerald-600">
                                            {account.email_verified_label}
                                        </span>
                                    ) : (
                                        <span className="text-amber-600">
                                            Not verified
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow label="Last sign-in" icon={Clock}>
                                    {account.last_login_label}
                                </DetailRow>
                                <DetailRow label="Sign-in timestamp">
                                    {account.last_login_exact}
                                </DetailRow>
                                <DetailRow
                                    label="Two-factor auth"
                                    icon={ShieldCheck}
                                >
                                    {account.two_factor_enabled ? (
                                        <span className="text-emerald-600">
                                            Enabled
                                        </span>
                                    ) : (
                                        <span className="text-red-600">
                                            Not enabled
                                        </span>
                                    )}
                                </DetailRow>
                                <DetailRow label="Account status">
                                    <StatusBadge status={person.status} />
                                </DetailRow>
                            </div>
                        </SectionCard>

                        {!access.is_teacher && (
                            <SectionCard title="Roles & Permissions">
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-caption-1 font-semibold tracking-wide text-navy-400 uppercase">
                                            Assigned roles
                                        </p>
                                        {access.roles.length === 0 ? (
                                            <p className="mt-2 text-body-3 text-navy-300">
                                                No roles assigned.
                                            </p>
                                        ) : (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {access.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="outline"
                                                        className="border-aqua-200 bg-aqua-50 text-caption-1 font-semibold text-aqua-700"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-caption-1 font-semibold tracking-wide text-navy-400 uppercase">
                                            Effective permissions
                                        </p>
                                        {access.has_all_permissions ? (
                                            <p className="mt-2 rounded-lg border border-aqua-200 bg-aqua-50/60 p-3 text-body-3 text-aqua-700">
                                                This user is a super
                                                administrator and implicitly
                                                holds every permission.
                                            </p>
                                        ) : access.permission_groups.length ===
                                          0 ? (
                                            <p className="mt-2 text-body-3 text-navy-300">
                                                No permissions granted.
                                            </p>
                                        ) : (
                                            <div className="mt-3 space-y-3">
                                                {access.permission_groups.map(
                                                    (group) => (
                                                        <div
                                                            key={group.group}
                                                            className="rounded-lg border border-navy-50 p-3"
                                                        >
                                                            <p className="text-body-3 font-semibold text-navy-500">
                                                                {group.group}
                                                                <span className="ml-2 text-caption-1 font-normal text-navy-300">
                                                                    {
                                                                        group
                                                                            .permissions
                                                                            .length
                                                                    }
                                                                </span>
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                {group.permissions.map(
                                                                    (
                                                                        permission,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                permission
                                                                            }
                                                                            className="rounded-md bg-navy-50 px-2 py-1 text-caption-1 text-navy-500"
                                                                        >
                                                                            {
                                                                                permission
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {learning.applicable && (
                            <>
                                <SectionCard title="Course Enrollments">
                                    {learning.enrollments.length === 0 ? (
                                        <EmptyHint>
                                            This teacher is not enrolled in any
                                            courses yet.
                                        </EmptyHint>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Course
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Status
                                                        </TableHead>
                                                        <TableHead className="w-40 text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Progress
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Enrolled
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Completed
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {learning.enrollments.map(
                                                        (enrollment) => (
                                                            <TableRow
                                                                key={
                                                                    enrollment.id
                                                                }
                                                                className="border-navy-50"
                                                            >
                                                                <TableCell className="font-medium text-navy-500">
                                                                    {
                                                                        enrollment.course
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <StatusBadge
                                                                        status={
                                                                            enrollment.status
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <Progress
                                                                            value={
                                                                                enrollment.progress
                                                                            }
                                                                            className="w-20"
                                                                        />
                                                                        <span className="text-caption-1 text-navy-400 tabular-nums">
                                                                            {
                                                                                enrollment.progress
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-body-3 text-navy-400">
                                                                    {
                                                                        enrollment.enrolled_label
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-body-3 text-navy-400">
                                                                    {
                                                                        enrollment.completed_label
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </SectionCard>

                                <SectionCard title="Certificates">
                                    {learning.certificates.length === 0 ? (
                                        <EmptyHint>
                                            No certificates issued yet.
                                        </EmptyHint>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Certificate
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Course
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Status
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Issued
                                                        </TableHead>
                                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                            Expires
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {learning.certificates.map(
                                                        (certificate) => (
                                                            <TableRow
                                                                key={
                                                                    certificate.id
                                                                }
                                                                className="border-navy-50"
                                                            >
                                                                <TableCell className="font-mono text-body-4 text-navy-500">
                                                                    {
                                                                        certificate.number
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="font-medium text-navy-500">
                                                                    {
                                                                        certificate.course
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <StatusBadge
                                                                        status={
                                                                            certificate.status
                                                                        }
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-body-3 text-navy-400">
                                                                    {
                                                                        certificate.issued_label
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-body-3 text-navy-400">
                                                                    {
                                                                        certificate.expires_label
                                                                    }
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </SectionCard>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

PersonShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'People', href: people.index() },
        { title: 'Details', href: people.index() },
    ],
};
