import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    Download,
    FileSpreadsheet,
    FileText,
    Pencil,
    Plus,
    Search,
    Shield,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AquaFilterChips,
    AquaFilterPopover,
} from '@/components/aquacert/aqua-filter-popover';
import type {
    AquaFilterField,
    AquaFilterValues,
} from '@/components/aquacert/aqua-filter-popover';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { DataPagination } from '@/components/admin/data-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type RoleFilters = {
    search: string;
    kind: string;
    users: string;
    permissions: string;
};

function queryPayload(search: string, advanced: AquaFilterValues) {
    return {
        search: search || undefined,
        kind: advanced.kind || undefined,
        users: advanced.users || undefined,
        permissions: advanced.permissions || undefined,
    };
}

const FILTER_FIELDS: AquaFilterField[] = [
    {
        key: 'kind',
        label: 'Role type',
        anyLabel: 'Any type',
        options: [
            { value: 'system', label: 'System (super admin)' },
            { value: 'custom', label: 'Custom roles' },
        ],
    },
    {
        key: 'users',
        label: 'Assigned users',
        anyLabel: 'Any users',
        options: [
            { value: 'with', label: 'Has assigned users' },
            { value: 'without', label: 'No assigned users' },
        ],
    },
    {
        key: 'permissions',
        label: 'Permission volume',
        anyLabel: 'Any permissions',
        options: [
            { value: 'none', label: 'No permissions' },
            { value: 'some', label: 'Some (1–19)' },
            { value: 'many', label: 'Many (20+)' },
        ],
    },
];

interface RolesIndexProps {
    roles: Paginated<AdminRoleListItem>;
    filters: RoleFilters;
}

export default function RolesIndex({
    roles: paginated,
    filters,
}: RolesIndexProps) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    const activeFilters: AquaFilterValues = useMemo(
        () => ({
            kind: filters.kind ?? '',
            users: filters.users ?? '',
            permissions: filters.permissions ?? '',
        }),
        [filters.kind, filters.users, filters.permissions],
    );

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(roles.index().url, queryPayload(search, activeFilters), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- advanced filters applied explicitly
    }, [search]);

    const applyFilters = (next: AquaFilterValues) => {
        router.get(roles.index().url, queryPayload(search, next), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportHref = (format: 'csv' | 'xlsx') =>
        roles.export({
            query: {
                ...queryPayload(search, activeFilters),
                format,
            },
        }).url;

    const displayName = (name: string) =>
        name
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-[#f8fafc] p-4 md:p-6">
                <AquaPageHeader
                    title="Roles & Permissions"
                    subtitle="Access control across the AquaCert platform."
                    actions={
                        can(PERMISSIONS.ROLES.CREATE) ? (
                            <Button
                                asChild
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                <Link href={roles.create().url}>
                                    <Plus className="size-4" />
                                    Create Role
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-sm flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search roles & permissions..."
                                className="border-navy-100 pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <AquaFilterPopover
                                fields={FILTER_FIELDS}
                                values={activeFilters}
                                onApply={applyFilters}
                                description="Narrow roles by type, assigned users, or permission volume."
                            />

                            {can(PERMISSIONS.ROLES.EXPORT) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-navy-100 text-navy-400"
                                        >
                                            <Download className="size-4" />
                                            Export
                                            <ChevronDown className="size-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <a href={exportHref('csv')}>
                                                <FileText className="size-4" />
                                                Export as CSV
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={exportHref('xlsx')}>
                                                <FileSpreadsheet className="size-4" />
                                                Export as Excel
                                            </a>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>

                    <AquaFilterChips
                        fields={FILTER_FIELDS}
                        values={activeFilters}
                        onChange={applyFilters}
                        className="mt-3"
                    />

                    <div className="mt-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Role
                                    </TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Users
                                    </TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Permissions
                                    </TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Scope
                                    </TableHead>
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Updated
                                    </TableHead>
                                    <TableHead className="w-24" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.data.map((role) => (
                                    <TableRow
                                        key={role.id}
                                        className="border-navy-50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 items-center justify-center rounded-lg bg-aqua-50 text-aqua-700">
                                                    <Shield className="size-4" />
                                                </span>
                                                <span>
                                                    <span className="block font-semibold text-navy-500">
                                                        {displayName(role.name)}
                                                    </span>
                                                    {role.is_system ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="mt-1 border-navy-100 text-navy-400"
                                                        >
                                                            System
                                                        </Badge>
                                                    ) : null}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500">
                                            {role.users_count} users
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500">
                                            {role.is_system
                                                ? 'All permissions'
                                                : `${role.permissions_count} permissions`}
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500">
                                            {role.scope}
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-400">
                                            {role.updated_label}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                {can(PERMISSIONS.ROLES.EDIT) && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-navy-400"
                                                    >
                                                        <Link
                                                            href={
                                                                roles.edit(
                                                                    role.id,
                                                                ).url
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {can(PERMISSIONS.ROLES.DELETE) &&
                                                    !role.is_system && (
                                                        <ConfirmDeleteDialog
                                                            description={
                                                                <>
                                                                    Delete the{' '}
                                                                    <strong>
                                                                        {displayName(
                                                                            role.name,
                                                                        )}
                                                                    </strong>{' '}
                                                                    role? Users
                                                                    with this
                                                                    role will
                                                                    lose its
                                                                    permissions.
                                                                </>
                                                            }
                                                            onConfirm={() =>
                                                                router.delete(
                                                                    roles.destroy(
                                                                        role.id,
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
                                                                className="size-8 text-navy-300 hover:text-destructive"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </ConfirmDeleteDialog>
                                                    )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {paginated.data.length === 0 && (
                            <div className="px-4 py-16 text-center">
                                <Shield className="mx-auto size-10 text-navy-200" />
                                <h3 className="mt-4 text-sm font-semibold text-navy-500">
                                    No roles found
                                </h3>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <DataPagination meta={paginated} />
                    </div>
                </Card>
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles & Permissions', href: roles.index() },
    ],
};
