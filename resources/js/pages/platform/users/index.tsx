import { Head, Link, WhenVisible, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Mail,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    UsersRound,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { DataPagination } from '@/components/admin/data-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
import users from '@/routes/platform/users';
import { avatarUrl, SUPER_ADMIN_ROLE } from '@/types/admin';
import type { AdminUser, Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface UsersIndexProps {
    users: Paginated<AdminUser>;
    roles: string[];
    filters: { search: string; role: string };
    superAdminCount: number;
    stats?: { total: number; verified: number; roles: number };
}

const ALL_ROLES = 'all';

export default function UsersIndex({
    users: paginated,
    roles,
    filters,
    superAdminCount,
    stats,
}: UsersIndexProps) {
    const { can } = usePermission();
    const actorIsSuperAdmin =
        usePage().props.auth.user?.is_super_admin ?? false;
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role || ALL_ROLES);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                users.index().url,
                {
                    search: search || undefined,
                    role: role === ALL_ROLES ? undefined : role,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, role]);

    const handleDelete = (user: AdminUser) => {
        router.delete(users.destroy(user.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Users" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Users"
                    description="Manage accounts, assign roles, and control platform access."
                    icon={Users}
                >
                    {can(PERMISSIONS.USERS.CREATE) && (
                        <Button asChild>
                            <Link href={users.create().url}>
                                <Plus className="h-4 w-4" /> Add user
                            </Link>
                        </Button>
                    )}
                </AdminPageHeader>

                {/* Deferred stats — loaded when scrolled into view */}
                <WhenVisible
                    data="stats"
                    fallback={
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[0, 1, 2].map((i) => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
                    }
                >
                    {stats && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid gap-4 sm:grid-cols-3"
                        >
                            <StatCard
                                label="Total users"
                                value={stats.total}
                                icon={UsersRound}
                            />
                            <StatCard
                                label="Verified"
                                value={stats.verified}
                                icon={UserCheck}
                            />
                            <StatCard
                                label="Roles"
                                value={stats.roles}
                                icon={ShieldCheck}
                            />
                        </motion.div>
                    )}
                </WhenVisible>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                            className="pl-9"
                        />
                    </div>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_ROLES}>All roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem
                                    key={r}
                                    value={r}
                                    className="capitalize"
                                >
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>User</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Roles
                                    </TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        Joined
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {paginated.data.map((user) => {
                                        const targetIsSuperAdmin =
                                            user.roles.some(
                                                (r) =>
                                                    r.name === SUPER_ADMIN_ROLE,
                                            );
                                        // Only a super-admin may edit/delete a super-admin account.
                                        const canManage =
                                            !targetIsSuperAdmin ||
                                            actorIsSuperAdmin;
                                        // The last super-admin can never be deleted.
                                        const lockDelete =
                                            targetIsSuperAdmin &&
                                            superAdminCount <= 1;

                                        return (
                                            <motion.tr
                                                key={user.id}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 28,
                                                }}
                                                className="border-b transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar user={user} />
                                                        <div className="min-w-0">
                                                            <span className="block truncate font-medium text-foreground">
                                                                {user.name}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.length ===
                                                        0 ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                —
                                                            </span>
                                                        ) : (
                                                            user.roles.map(
                                                                (r) => (
                                                                    <Badge
                                                                        key={
                                                                            r.id
                                                                        }
                                                                        variant="secondary"
                                                                        className="capitalize"
                                                                    >
                                                                        {r.name}
                                                                    </Badge>
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                dateStyle:
                                                                    'medium',
                                                            },
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {can(
                                                            PERMISSIONS.USERS
                                                                .VIEW,
                                                        ) && (
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Link
                                                                    href={
                                                                        users.show(
                                                                            user.id,
                                                                        ).url
                                                                    }
                                                                    title="View"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {can(
                                                            PERMISSIONS.USERS
                                                                .EDIT,
                                                        ) &&
                                                            canManage && (
                                                                <Button
                                                                    asChild
                                                                    variant="ghost"
                                                                    size="icon"
                                                                >
                                                                    <Link
                                                                        href={
                                                                            users.edit(
                                                                                user.id,
                                                                            )
                                                                                .url
                                                                        }
                                                                        title="Edit"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        {can(
                                                            PERMISSIONS.USERS
                                                                .DELETE,
                                                        ) &&
                                                            canManage &&
                                                            (lockDelete ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    disabled
                                                                    className="text-muted-foreground"
                                                                    title="The last super administrator cannot be deleted."
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <ConfirmDeleteDialog
                                                                    description={
                                                                        <>
                                                                            This
                                                                            will
                                                                            permanently
                                                                            delete{' '}
                                                                            <strong>
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </strong>{' '}
                                                                            and
                                                                            all
                                                                            associated
                                                                            data.
                                                                        </>
                                                                    }
                                                                    onConfirm={() =>
                                                                        handleDelete(
                                                                            user,
                                                                        )
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-muted-foreground hover:text-destructive"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </ConfirmDeleteDialog>
                                                            ))}
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </TableBody>
                        </Table>

                        {paginated.data.length === 0 && (
                            <div className="px-4 py-16 text-center">
                                <UsersRound className="mx-auto h-10 w-10 text-muted-foreground/40" />
                                <h3 className="mt-4 text-sm font-semibold">
                                    No users found
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        )}
                    </div>

                    <DataPagination meta={paginated} />
                </div>
            </div>
        </>
    );
}

function Avatar({ user }: { user: AdminUser }) {
    const url = avatarUrl(user.avatar);

    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-secondary text-sm font-semibold text-secondary-foreground">
            {url ? (
                <img
                    src={url}
                    alt={user.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                user.name.charAt(0).toUpperCase()
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Users;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: users.index() },
    ],
};
