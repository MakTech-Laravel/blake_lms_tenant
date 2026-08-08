import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Check,
    Fingerprint,
    Globe,
    Maximize2,
    Minus,
    Pencil,
    Search,
    Shield,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { SectionCard } from '@/components/aquacert/section-card';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePermission } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/platform';
import roles from '@/routes/platform/roles';
import type {
    AdminRoleSummary,
    RoleAssignedUser,
    RolePermissionGroup,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type RoleShowProps = {
    role: AdminRoleSummary;
    permissionGroups: RolePermissionGroup[];
    assignedUsers: RoleAssignedUser[];
};

/** "granted" hides permissions the role does not hold; "all" shows the full matrix. */
type PermissionView = 'granted' | 'all';

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
            <span className="text-right text-body-3 font-medium text-navy-500">
                {children}
            </span>
        </div>
    );
}

function filterPermissionGroups(
    groups: RolePermissionGroup[],
    view: PermissionView,
    search: string,
): RolePermissionGroup[] {
    const term = search.trim().toLowerCase();

    return groups
        .map((group) => ({
            ...group,
            permissions: group.permissions.filter((permission) => {
                if (view === 'granted' && !permission.granted) {
                    return false;
                }

                if (term === '') {
                    return true;
                }

                return (
                    permission.label.toLowerCase().includes(term) ||
                    permission.name.toLowerCase().includes(term)
                );
            }),
        }))
        .filter((group) => group.permissions.length > 0);
}

function PermissionViewToggle({
    value,
    onChange,
}: {
    value: PermissionView;
    onChange: (next: PermissionView) => void;
}) {
    return (
        <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={value}
            onValueChange={(next) => next && onChange(next as PermissionView)}
            className="border-navy-100"
        >
            <ToggleGroupItem
                value="granted"
                className="h-7 border-navy-100 px-2.5 text-caption-1 text-navy-400 data-[state=on]:bg-aqua-50 data-[state=on]:text-aqua-700"
            >
                Granted
            </ToggleGroupItem>
            <ToggleGroupItem
                value="all"
                className="h-7 border-navy-100 px-2.5 text-caption-1 text-navy-400 data-[state=on]:bg-aqua-50 data-[state=on]:text-aqua-700"
            >
                All
            </ToggleGroupItem>
        </ToggleGroup>
    );
}

function PermissionGroupList({ groups }: { groups: RolePermissionGroup[] }) {
    if (groups.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
                No permissions match this view.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {groups.map((group) => (
                <div
                    key={group.group}
                    className="rounded-lg border border-navy-50 p-3"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-body-3 font-semibold text-navy-500">
                            {group.group}
                        </p>
                        <span className="text-caption-1 text-navy-300 tabular-nums">
                            {group.granted_count}/{group.total}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.permissions.map((permission) => (
                            <span
                                key={permission.name}
                                title={permission.name}
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption-1',
                                    permission.granted
                                        ? 'bg-aqua-50 font-medium text-aqua-700'
                                        : 'bg-navy-50/60 text-navy-300',
                                )}
                            >
                                {permission.granted ? (
                                    <Check className="size-3" />
                                ) : (
                                    <Minus className="size-3" />
                                )}
                                {permission.label}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function RoleShow({
    role,
    permissionGroups,
    assignedUsers,
}: RoleShowProps) {
    const { can } = usePermission();
    const [view, setView] = useState<PermissionView>('granted');
    const [expanded, setExpanded] = useState(false);
    const [dialogSearch, setDialogSearch] = useState('');

    const coverage =
        role.total_count > 0
            ? Math.round((role.granted_count / role.total_count) * 100)
            : 0;

    const cardGroups = useMemo(
        () => filterPermissionGroups(permissionGroups, view, ''),
        [permissionGroups, view],
    );

    const dialogGroups = useMemo(
        () => filterPermissionGroups(permissionGroups, view, dialogSearch),
        [permissionGroups, view, dialogSearch],
    );

    return (
        <>
            <Head title={role.display_name} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={role.display_name}
                    subtitle={`${role.is_system ? 'System role' : 'Custom role'} · ${role.scope} scope`}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="border-navy-100 text-navy-400"
                            >
                                <Link href={roles.index().url}>
                                    <ArrowLeft className="size-4" />
                                    Back to roles
                                </Link>
                            </Button>

                            {can(PERMISSIONS.ROLES.DELETE) &&
                                !role.is_system && (
                                    <ConfirmDeleteDialog
                                        description={
                                            <>
                                                Delete the{' '}
                                                <strong>
                                                    {role.display_name}
                                                </strong>{' '}
                                                role? Users with this role will
                                                lose its permissions.
                                            </>
                                        }
                                        onConfirm={() =>
                                            router.delete(
                                                roles.destroy(role.id).url,
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

                            {can(PERMISSIONS.ROLES.EDIT) && (
                                <Button
                                    asChild
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Link href={roles.edit(role.id).url}>
                                        <Pencil className="size-4" />
                                        Edit Role
                                    </Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AquaStatCard
                        label="Assigned Users"
                        value={role.users_count}
                        icon={Users}
                    />
                    <AquaStatCard
                        label="Granted Permissions"
                        value={
                            role.is_system
                                ? 'All'
                                : `${role.granted_count} / ${role.total_count}`
                        }
                        icon={Fingerprint}
                    />
                    <AquaStatCard
                        label="Permission Coverage"
                        value={`${coverage}%`}
                        icon={ShieldCheck}
                        className={
                            coverage === 100
                                ? '[&_span]:bg-emerald-50 [&_span]:text-emerald-600'
                                : undefined
                        }
                    />
                    <AquaStatCard
                        label="Role Type"
                        value={role.is_system ? 'System' : 'Custom'}
                        icon={Shield}
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6">
                        <SectionCard title="Role Summary">
                            <div className="flex flex-col items-center gap-3 pb-4 text-center">
                                <span className="flex size-16 items-center justify-center rounded-2xl bg-aqua-50 text-aqua-700">
                                    <Shield className="size-7" />
                                </span>
                                <div>
                                    <p className="text-h6 font-semibold text-navy-500">
                                        {role.display_name}
                                    </p>
                                    <p className="font-mono text-body-4 text-navy-300">
                                        {role.name}
                                    </p>
                                </div>
                                {role.is_system && (
                                    <Badge
                                        variant="outline"
                                        className="border-navy-100 bg-navy-50 text-caption-1 font-semibold text-navy-400"
                                    >
                                        System role
                                    </Badge>
                                )}
                            </div>

                            <div className="border-t border-navy-50 pt-2">
                                <DetailRow label="Role ID">
                                    #{role.id}
                                </DetailRow>
                                <DetailRow label="Scope" icon={Globe}>
                                    {role.scope}
                                </DetailRow>
                                <DetailRow label="Guard">
                                    {role.guard_name}
                                </DetailRow>
                                <DetailRow label="Created">
                                    {role.created_label}
                                </DetailRow>
                                <DetailRow
                                    label="Last updated"
                                    icon={CalendarClock}
                                >
                                    {role.updated_relative}
                                </DetailRow>
                            </div>

                            {role.is_system && (
                                <p className="mt-4 rounded-lg border border-aqua-200 bg-aqua-50/60 p-3 text-body-4 text-aqua-700">
                                    This role bypasses permission checks and
                                    always holds every platform permission. Its
                                    permission list cannot be edited.
                                </p>
                            )}
                        </SectionCard>

                        <SectionCard title="Coverage by Module">
                            <ScrollArea
                                type="auto"
                                className={cn('h-72 pr-3', SCROLL_THUMB)}
                            >
                                <ul className="space-y-3">
                                    {permissionGroups.map((group) => (
                                        <li key={group.group}>
                                            <div className="flex items-center justify-between text-body-4">
                                                <span className="font-medium text-navy-500">
                                                    {group.group}
                                                </span>
                                                <span className="text-navy-300 tabular-nums">
                                                    {group.granted_count}/
                                                    {group.total}
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    (group.granted_count /
                                                        group.total) *
                                                    100
                                                }
                                                className="mt-1.5 h-1.5"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </ScrollArea>
                        </SectionCard>
                    </div>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <SectionCard
                            title="Permissions"
                            action={
                                <div className="flex items-center gap-2">
                                    <span className="hidden text-body-4 text-navy-300 sm:inline">
                                        {role.granted_count} of{' '}
                                        {role.total_count} granted
                                    </span>
                                    <PermissionViewToggle
                                        value={view}
                                        onChange={setView}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        title="Expand permissions"
                                        className="size-8 border-navy-100 text-navy-400"
                                        onClick={() => setExpanded(true)}
                                    >
                                        <Maximize2 className="size-4" />
                                        <span className="sr-only">
                                            Expand permissions
                                        </span>
                                    </Button>
                                </div>
                            }
                        >
                            <ScrollArea
                                type="auto"
                                className={cn('h-104 pr-3', SCROLL_THUMB)}
                            >
                                <PermissionGroupList groups={cardGroups} />
                            </ScrollArea>
                        </SectionCard>

                        <SectionCard
                            title="Assigned Users"
                            action={
                                <span className="text-body-4 text-navy-300">
                                    {role.users_count} total
                                </span>
                            }
                        >
                            {assignedUsers.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-navy-100 py-8 text-center text-body-3 text-navy-300">
                                    No users hold this role yet.
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
                                                    User
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Type
                                                </TableHead>
                                                <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignedUsers.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className="border-navy-50"
                                                >
                                                    <TableCell>
                                                        <Link
                                                            href={
                                                                user.profile_url
                                                            }
                                                            className="flex items-center gap-3"
                                                        >
                                                            <Avatar className="size-9 bg-aqua-50">
                                                                {user.avatar_url && (
                                                                    <AvatarImage
                                                                        src={
                                                                            user.avatar_url
                                                                        }
                                                                        alt={
                                                                            user.name
                                                                        }
                                                                    />
                                                                )}
                                                                <AvatarFallback className="bg-aqua-50 text-caption-1 font-semibold text-aqua-700">
                                                                    {
                                                                        user.initials
                                                                    }
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                                <span className="block font-semibold text-navy-500">
                                                                    {user.name}
                                                                </span>
                                                                <span className="block text-body-4 text-navy-300">
                                                                    {user.email}
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-body-3 font-medium text-aqua-600">
                                                        {user.type_label}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={user.status}
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

            <Dialog
                open={expanded}
                onOpenChange={(open) => {
                    setExpanded(open);

                    if (!open) {
                        setDialogSearch('');
                    }
                }}
            >
                <DialogContent className="flex h-[80vh] flex-col gap-4 overflow-hidden sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-navy-500">
                            {role.display_name} permissions
                        </DialogTitle>
                        <DialogDescription>
                            {role.granted_count} of {role.total_count} platform
                            permissions granted.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                            <Input
                                value={dialogSearch}
                                onChange={(event) =>
                                    setDialogSearch(event.target.value)
                                }
                                placeholder="Search permissions..."
                                className="border-navy-100 pl-9"
                            />
                        </div>
                        <PermissionViewToggle value={view} onChange={setView} />
                    </div>

                    <ScrollArea
                        type="auto"
                        className={cn('min-h-0 flex-1 pr-3', SCROLL_THUMB)}
                    >
                        <PermissionGroupList groups={dialogGroups} />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}

RoleShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles & Permissions', href: roles.index() },
        { title: 'Details', href: roles.index() },
    ],
};
