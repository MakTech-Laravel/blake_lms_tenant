import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Layers,
    MapPin,
    Pencil,
    Plus,
    Search,
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
import { useTenant } from '@/hooks/use-tenant';
import branches from '@/routes/school/branches';
import type { Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface BranchListItem {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    address: string | null;
    is_active: boolean;
    users_count: number;
    courses_count: number;
}

interface BranchesIndexProps {
    branches: Paginated<BranchListItem>;
    filters: { search: string };
}

export default function BranchesIndex({
    branches: paginated,
    filters,
}: BranchesIndexProps) {
    const { can } = usePermission();
    const { slug } = useTenant();
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                branches.index(slug).url,
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, slug]);

    return (
        <>
            <Head title="Branches" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Branches"
                    description="Your school's locations. Staff pinned to a branch only ever see that branch's data."
                    icon={Building2}
                >
                    {can(PERMISSIONS.SCHOOL_BRANCHES.CREATE) && (
                        <Button asChild>
                            <Link href={branches.create(slug).url}>
                                <Plus className="h-4 w-4" /> Add branch
                            </Link>
                        </Button>
                    )}
                </AdminPageHeader>

                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search branches…"
                        className="pl-9"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Staff
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Courses
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {paginated.data.map((branch) => (
                                        <motion.tr
                                            key={branch.id}
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
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {branch.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {branch.address ??
                                                                branch.email ??
                                                                `/${branch.slug}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <UsersIcon className="h-3.5 w-3.5" />
                                                    {branch.users_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Layers className="h-3.5 w-3.5" />
                                                    {branch.courses_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge
                                                    variant={
                                                        branch.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {branch.is_active
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {can(
                                                        PERMISSIONS
                                                            .SCHOOL_BRANCHES
                                                            .EDIT,
                                                    ) && (
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <Link
                                                                href={
                                                                    branches.edit(
                                                                        [
                                                                            slug,
                                                                            branch.slug,
                                                                        ],
                                                                    ).url
                                                                }
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                    {can(
                                                        PERMISSIONS
                                                            .SCHOOL_BRANCHES
                                                            .DELETE,
                                                    ) && (
                                                        <ConfirmDeleteDialog
                                                            description={
                                                                <>
                                                                    Delete the{' '}
                                                                    <strong>
                                                                        {
                                                                            branch.name
                                                                        }
                                                                    </strong>{' '}
                                                                    branch? Its
                                                                    courses
                                                                    become
                                                                    school-wide.
                                                                    Deactivate
                                                                    instead to
                                                                    keep it
                                                                    recoverable.
                                                                </>
                                                            }
                                                            onConfirm={() =>
                                                                router.delete(
                                                                    branches.destroy(
                                                                        [
                                                                            slug,
                                                                            branch.slug,
                                                                        ],
                                                                    ).url,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
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
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>

                        {paginated.data.length === 0 && (
                            <div className="px-4 py-16 text-center">
                                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
                                <h3 className="mt-4 text-sm font-semibold">
                                    No branches found
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a branch to start scoping staff and
                                    courses to a location.
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
