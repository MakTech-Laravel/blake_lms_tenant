import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    CreditCard,
    Download,
    FileSpreadsheet,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    ShieldOff,
    ShieldCheck,
    Trash2,
    Eye,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { DataPagination } from '@/components/admin/data-pagination';
import {
    AquaFilterChips,
    AquaFilterPopover,
} from '@/components/aquacert/aqua-filter-popover';
import type {
    AquaFilterField,
    AquaFilterValues,
} from '@/components/aquacert/aqua-filter-popover';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import type { SortDirection } from '@/components/aquacert/sortable-table-head';
import { SortableTableHead } from '@/components/aquacert/sortable-table-head';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import organizations from '@/routes/platform/organizations';
import type {
    OrganizationListItem,
    OrganizationStats,
    Paginated,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type OrganizationFilters = {
    search: string;
    status: string;
    plan: string;
    region: string;
    renewal: string;
    sort: string;
    direction: SortDirection;
};

type FilterOption = { value: string; label: string };

interface OrganizationsIndexProps {
    organizations: Paginated<OrganizationListItem>;
    filters: OrganizationFilters;
    stats: OrganizationStats;
    planOptions: FilterOption[];
    regionOptions: FilterOption[];
}

function queryPayload(
    search: string,
    advanced: AquaFilterValues,
    sort: string,
    direction: SortDirection,
) {
    return {
        search: search || undefined,
        status: advanced.status || undefined,
        plan: advanced.plan || undefined,
        region: advanced.region || undefined,
        renewal: advanced.renewal || undefined,
        sort: sort !== 'name' || direction !== 'asc' ? sort : undefined,
        direction: direction === 'desc' ? 'desc' : undefined,
    };
}

export default function OrganizationsIndex({
    organizations: paginated,
    filters,
    stats,
    planOptions,
    regionOptions,
}: OrganizationsIndexProps) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');
    const [lastSearchTerm, setLastSearchTerm] = useState(filters.search ?? '');
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const firstRender = useRef(true);

    const filterFields: AquaFilterField[] = useMemo(
        () => [
            {
                key: 'status',
                label: 'Status',
                anyLabel: 'Any status',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'trial', label: 'Trial' },
                    { value: 'suspended', label: 'Suspended' },
                ],
            },
            {
                key: 'plan',
                label: 'Plan',
                anyLabel: 'Any plan',
                options: planOptions,
            },
            {
                key: 'region',
                label: 'Region',
                anyLabel: 'Any region',
                options: regionOptions,
            },
            {
                key: 'renewal',
                label: 'Renewal window',
                anyLabel: 'Any renewal date',
                options: [
                    { value: '30', label: 'Renews in 30 days' },
                    { value: '90', label: 'Renews in 90 days' },
                    { value: 'overdue', label: 'Renewal overdue' },
                ],
            },
        ],
        [planOptions, regionOptions],
    );

    const activeFilters: AquaFilterValues = useMemo(
        () => ({
            status: filters.status ?? '',
            plan: filters.plan ?? '',
            region: filters.region ?? '',
            renewal: filters.renewal ?? '',
        }),
        [filters.status, filters.plan, filters.region, filters.renewal],
    );

    const sort = filters.sort ?? 'name';
    const direction: SortDirection = filters.direction === 'desc' ? 'desc' : 'asc';

    // The server's term wins whenever it changes — a back navigation or a cleared
    // chip must be reflected in the box — while typing wins in between. Adjusted
    // during render so the input never paints a term the server has replaced.
    if (lastSearchTerm !== (filters.search ?? '')) {
        setLastSearchTerm(filters.search ?? '');
        setSearch(filters.search ?? '');
    }

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                organizations.index().url,
                queryPayload(search, activeFilters, sort, direction),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- advanced filters applied explicitly
    }, [search]);

    const applyFilters = (next: AquaFilterValues) => {
        router.get(
            organizations.index().url,
            queryPayload(search, next, sort, direction),
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const applySort = (column: string, nextDirection: SortDirection) => {
        router.get(
            organizations.index().url,
            queryPayload(search, activeFilters, column, nextDirection),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const exportHref = (format: 'csv' | 'xlsx', scope: 'all' | 'selected') =>
        organizations.export({
            query: {
                ...queryPayload(search, activeFilters, sort, direction),
                format,
                scope,
                ...(scope === 'selected' ? { ids: [...selected] } : {}),
            },
        }).url;

    const pageIds = paginated.data.map((organization) => organization.id);
    const allOnPageSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.has(id));

    const toggleAllOnPage = (checked: boolean) => {
        setSelected((current) => {
            const next = new Set(current);

            for (const id of pageIds) {
                if (checked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
            }

            return next;
        });
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelected((current) => {
            const next = new Set(current);

            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    };

    const changeStatus = (
        organization: OrganizationListItem,
        status: 'active' | 'suspended',
    ) => {
        router.patch(
            organizations.status(organization.slug).url,
            { status },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <>
            <Head title="Organizations" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Organizations"
                    subtitle={`Managing ${stats.total} swim school organization${stats.total === 1 ? '' : 's'}`}
                    actions={
                        can(PERMISSIONS.SCHOOLS.CREATE) ? (
                            <Button
                                asChild
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                <Link href={organizations.create().url}>
                                    <Plus className="size-4" />
                                    Create Organization
                                </Link>
                            </Button>
                        ) : null
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AquaStatCard
                        label="Trial"
                        value={stats.trial}
                        icon={Zap}
                    />
                    <AquaStatCard
                        label="Suspended"
                        value={stats.suspended}
                        icon={ShieldOff}
                    />
                    <AquaStatCard
                        label="Total MRR"
                        value={stats.mrr_label}
                        icon={CreditCard}
                    />
                </div>

                <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-sm flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search organizations..."
                                className="border-navy-100 pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <AquaFilterPopover
                                fields={filterFields}
                                values={activeFilters}
                                onApply={applyFilters}
                                description="Narrow organizations by status, plan, region, or upcoming renewal."
                            />

                            {can(PERMISSIONS.SCHOOLS.EXPORT) && (
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
                                            <a href={exportHref('csv', 'all')}>
                                                <FileText className="size-4" />
                                                Export as CSV
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={exportHref('xlsx', 'all')}>
                                                <FileSpreadsheet className="size-4" />
                                                Export as Excel
                                            </a>
                                        </DropdownMenuItem>
                                        {selected.size > 0 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <a
                                                        href={exportHref(
                                                            'csv',
                                                            'selected',
                                                        )}
                                                    >
                                                        <FileText className="size-4" />
                                                        Export {selected.size}{' '}
                                                        selected
                                                    </a>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>

                    <AquaFilterChips
                        fields={filterFields}
                        values={activeFilters}
                        onChange={applyFilters}
                        className="mt-3"
                    />

                    <div className="mt-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={allOnPageSelected}
                                            onCheckedChange={(checked) =>
                                                toggleAllOnPage(
                                                    checked === true,
                                                )
                                            }
                                            aria-label="Select all organizations on this page"
                                            className="border-navy-200"
                                        />
                                    </TableHead>
                                    <SortableTableHead
                                        column="name"
                                        label="Organization"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <SortableTableHead
                                        column="plan"
                                        label="Plan"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <SortableTableHead
                                        column="locations"
                                        label="Locations"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <SortableTableHead
                                        column="staff"
                                        label="Staff"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <SortableTableHead
                                        column="status"
                                        label="Status"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <SortableTableHead
                                        column="renewal"
                                        label="Renewal"
                                        activeColumn={sort}
                                        activeDirection={direction}
                                        onSort={applySort}
                                    />
                                    <TableHead className="w-20 text-right text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginated.data.map((organization) => (
                                    <TableRow
                                        key={organization.id}
                                        className="border-navy-50"
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.has(
                                                    organization.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    toggleOne(
                                                        organization.id,
                                                        checked === true,
                                                    )
                                                }
                                                aria-label={`Select ${organization.name}`}
                                                className="border-navy-200"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={
                                                    organizations.show(
                                                        organization.slug,
                                                    ).url
                                                }
                                                className="flex items-center gap-3"
                                            >
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-500 text-caption-1 font-bold text-white">
                                                    {organization.initials}
                                                </span>
                                                <span>
                                                    <span className="block font-semibold text-navy-500">
                                                        {organization.name}
                                                    </span>
                                                    <span className="block text-body-4 text-aqua-600">
                                                        {organization.region}
                                                    </span>
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500">
                                            {organization.plan}
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500 tabular-nums">
                                            {organization.locations_count}
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-500 tabular-nums">
                                            {organization.staff_count}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={organization.status}
                                            />
                                        </TableCell>
                                        <TableCell className="text-body-3 text-navy-400 tabular-nums">
                                            {organization.renewal_label}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <RowActions
                                                organization={organization}
                                                onChangeStatus={changeStatus}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {paginated.data.length === 0 && (
                            <div className="px-4 py-16 text-center">
                                <Building2 className="mx-auto size-10 text-navy-200" />
                                <h3 className="mt-4 text-sm font-semibold text-navy-500">
                                    No organizations found
                                </h3>
                                <p className="mt-1 text-body-4 text-navy-300">
                                    Adjust your search or filters to see more
                                    results.
                                </p>
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

interface RowActionsProps {
    organization: OrganizationListItem;
    onChangeStatus: (
        organization: OrganizationListItem,
        status: 'active' | 'suspended',
    ) => void;
}

function RowActions({ organization, onChangeStatus }: RowActionsProps) {
    const { can } = usePermission();
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const isSuspended = organization.status_value === 'suspended';

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-aqua-600"
                        aria-label={`Actions for ${organization.name}`}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    {can(PERMISSIONS.SCHOOLS.VIEW) && (
                        <DropdownMenuItem asChild>
                            <Link href={organization.show_url}>
                                <Eye className="size-4" />
                                View
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {can(PERMISSIONS.SCHOOLS.EDIT) && (
                        <DropdownMenuItem asChild>
                            <Link href={organization.edit_url}>
                                <Pencil className="size-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {can(PERMISSIONS.SCHOOLS.EDIT) && (
                        <DropdownMenuItem
                            onSelect={() =>
                                onChangeStatus(
                                    organization,
                                    isSuspended ? 'active' : 'suspended',
                                )
                            }
                        >
                            {isSuspended ? (
                                <ShieldCheck className="size-4" />
                            ) : (
                                <ShieldOff className="size-4" />
                            )}
                            {isSuspended ? 'Activate' : 'Suspend'}
                        </DropdownMenuItem>
                    )}
                    {can(PERMISSIONS.SCHOOLS.DELETE) && (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setConfirmingDelete(true)}
                        >
                            <Trash2 className="size-4" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Kept outside the menu so closing the menu does not unmount the dialog. */}
            <ConfirmDeleteDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                description={
                    <>
                        Delete <strong>{organization.name}</strong>? This removes
                        the organization and every location under it. Staff and
                        locations must be removed first.
                    </>
                }
                onConfirm={() =>
                    router.delete(
                        organizations.destroy(organization.slug).url,
                        { preserveScroll: true },
                    )
                }
            />
        </>
    );
}

OrganizationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Organizations', href: organizations.index() },
    ],
};
