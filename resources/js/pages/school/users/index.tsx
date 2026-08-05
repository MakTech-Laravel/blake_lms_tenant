import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Mail,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useBranch } from '@/hooks/use-branch';
import { usePermission } from '@/hooks/use-permissions';
import { useTenant } from '@/hooks/use-tenant';
import users from '@/routes/school/users';
import { avatarUrl, SUPER_ADMIN_ROLE } from '@/types/admin';
import type { AdminUser, BranchOption, Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface UsersIndexProps {
    users: Paginated<AdminUser>;
    roles: string[];
    branches: BranchOption[];
    filters: { search: string; role: string; branch: number | null };
    superAdminCount: number;
}

const ALL_ROLES = 'all';
const ALL_BRANCHES = 'all';

export default function UsersIndex({
    users: paginated,
    roles,
    branches,
    filters,
    superAdminCount,
}: UsersIndexProps) {
    const { can } = usePermission();
    const { slug } = useTenant();
    const { isHeadOffice } = useBranch();
    const actorIsSuperAdmin =
        usePage().props.auth.user?.is_super_admin ?? false;
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role || ALL_ROLES);
    const [branch, setBranch] = useState(
        filters.branch ? String(filters.branch) : ALL_BRANCHES,
    );
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                users.index(slug).url,
                {
                    search: search || undefined,
                    role: role === ALL_ROLES ? undefined : role,
                    branch: branch === ALL_BRANCHES ? undefined : branch,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, role, branch, slug]);

    const handleDelete = (user: AdminUser) => {
        router.delete(users.destroy([slug, user.id]).url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Staff" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Staff"
                    description="Manage your school's staff accounts and their roles."
                    icon={Users}
                >
                    {can(PERMISSIONS.SCHOOL_STAFF.CREATE) && (
                        <Button asChild>
                            <Link href={users.create(slug).url}>
                                <Plus className="h-4 w-4" /> Add staff
                            </Link>
                        </Button>
                    )}
                </AdminPageHeader>

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
                    {/* Branch-pinned staff see only their own branch, so the
                        filter would have exactly one option — hide it. */}
                    {isHeadOffice && branches.length > 0 && (
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_BRANCHES}>
                                    All branches
                                </SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>User</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Roles
                                    </TableHead>
                                    {isHeadOffice && (
                                        <TableHead className="hidden lg:table-cell">
                                            Branch
                                        </TableHead>
                                    )}
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
                                        const canManage =
                                            !targetIsSuperAdmin ||
                                            actorIsSuperAdmin;
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
                                                {isHeadOffice && (
                                                    <TableCell className="hidden lg:table-cell">
                                                        {user.branch ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="gap-1"
                                                            >
                                                                <MapPin className="h-3 w-3" />
                                                                {
                                                                    user.branch
                                                                        .name
                                                                }
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                Head office
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                )}
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
                                                            PERMISSIONS
                                                                .SCHOOL_STAFF
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
                                                                            [
                                                                                slug,
                                                                                user.id,
                                                                            ],
                                                                        ).url
                                                                    }
                                                                    title="View"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {can(
                                                            PERMISSIONS
                                                                .SCHOOL_STAFF
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
                                                                                [
                                                                                    slug,
                                                                                    user.id,
                                                                                ],
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
                                                            PERMISSIONS
                                                                .SCHOOL_STAFF
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
                                                                            </strong>
                                                                            .
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
                                    No staff found
                                </h3>
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
