import { Head, Link, router } from '@inertiajs/react';
import {
    KeyRound,
    Pencil,
    Plus,
    Search,
    Shield,
    Trash2,
    Users as UsersIcon,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import roles from '@/routes/platform/roles';
import type { AdminRoleListItem, Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface RolesIndexProps {
    roles: Paginated<AdminRoleListItem>;
    filters: { search: string };
}

export default function RolesIndex({
    roles: paginated,
    filters,
}: RolesIndexProps) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                roles.index().url,
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <>
            <Head title="Roles" />

            <div className="w-full space-y-6 bg-canvas px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Roles"
                    description="Define roles and the permissions they grant."
                    icon={Shield}
                >
                    {can(PERMISSIONS.ROLES.CREATE) && (
                        <Button asChild className="bg-navy-500 text-white hover:bg-navy-600">
                            <Link href={roles.create().url}>
                                <Plus className="h-4 w-4" /> Add role
                            </Link>
                        </Button>
                    )}
                </AdminPageHeader>

                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy-300" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roles…"
                        className="pl-9"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border border-navy-50 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-navy-50/60 hover:bg-navy-50/60">
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">Role</TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase hidden sm:table-cell">
                                        Permissions
                                    </TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase hidden sm:table-cell">
                                        Users
                                    </TableHead>
                                    <TableHead className="text-right text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {paginated.data.map((role) => {
                                        const isSuper =
                                            role.name === 'super-admin';

                                        return (
                                            <motion.tr
                                                key={role.id}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 350,
                                                    damping: 28,
                                                }}
                                                className="border-b transition-colors hover:bg-aqua-50/40"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <Shield className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium capitalize">
                                                            {role.name}
                                                        </span>
                                                        {isSuper && (
                                                            <Badge variant="outline">
                                                                system
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <KeyRound className="h-3 w-3" />
                                                        {isSuper
                                                            ? 'All'
                                                            : role.permissions_count}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <span className="flex items-center gap-1.5 text-sm text-navy-300">
                                                        <UsersIcon className="h-3.5 w-3.5" />
                                                        {role.users_count}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {can(
                                                            PERMISSIONS.ROLES
                                                                .EDIT,
                                                        ) && (
                                                            <Button
                                                                asChild
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Link
                                                                    href={
                                                                        roles.edit(
                                                                            role.id,
                                                                        ).url
                                                                    }
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        {can(
                                                            PERMISSIONS.ROLES
                                                                .DELETE,
                                                        ) &&
                                                            !isSuper && (
                                                                <ConfirmDeleteDialog
                                                                    description={
                                                                        <>
                                                                            Delete
                                                                            the{' '}
                                                                            <strong className="capitalize">
                                                                                {
                                                                                    role.name
                                                                                }
                                                                            </strong>{' '}
                                                                            role?
                                                                            Users
                                                                            with
                                                                            this
                                                                            role
                                                                            will
                                                                            lose
                                                                            its
                                                                            permissions.
                                                                        </>
                                                                    }
                                                                    onConfirm={() =>
                                                                        router.delete(
                                                                            roles.destroy(
                                                                                role.id,
                                                                            )
                                                                                .url,
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-navy-300 hover:text-destructive"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </ConfirmDeleteDialog>
                                                            )}
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
                                <Shield className="mx-auto h-10 w-10 text-navy-200" />
                                <h3 className="mt-4 text-sm font-semibold">
                                    No roles found
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

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles', href: roles.index() },
    ],
};
