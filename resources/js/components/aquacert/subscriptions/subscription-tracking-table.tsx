import { Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    ChevronDown,
    CircleCheck,
    CircleSlash,
    Clock,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    MoreHorizontal,
    RefreshCw,
    Search,
    ShieldOff,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DataPagination } from '@/components/admin/data-pagination';
import {
    AquaFilterChips,
    AquaFilterPopover,
} from '@/components/aquacert/aqua-filter-popover';
import type {
    AquaFilterField,
    AquaFilterValues,
} from '@/components/aquacert/aqua-filter-popover';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import type { SortDirection } from '@/components/aquacert/sortable-table-head';
import { SortableTableHead } from '@/components/aquacert/sortable-table-head';
import { StatusBadge } from '@/components/aquacert/status-badge';
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
import organizations from '@/routes/platform/organizations';
import subscriptions from '@/routes/platform/subscriptions';
import type {
    Paginated,
    SubscriptionStats,
    SubscriptionTrackingRow,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

export type TrackingFilters = {
    search: string;
    status: string;
    plan: string;
    sort: string;
    direction: SortDirection;
};

type FilterOption = { value: string; label: string };

interface SubscriptionTrackingTableProps {
    rows: Paginated<SubscriptionTrackingRow>;
    filters: TrackingFilters;
    stats: SubscriptionStats;
    planOptions: FilterOption[];
    statusOptions: FilterOption[];
}

/**
 * The tab is carried in the query string, so every navigation from here has to
 * restate it or the page falls back to the Plans tab.
 */
function queryPayload(
    search: string,
    advanced: AquaFilterValues,
    sort: string,
    direction: SortDirection,
) {
    return {
        tab: 'tracking',
        search: search || undefined,
        status: advanced.status || undefined,
        plan: advanced.plan || undefined,
        sort: sort !== 'organization' || direction !== 'asc' ? sort : undefined,
        direction: direction === 'desc' ? 'desc' : undefined,
    };
}

export function SubscriptionTrackingTable({
    rows,
    filters,
    stats,
    planOptions,
    statusOptions,
}: SubscriptionTrackingTableProps) {
    const { can } = usePermission();
    const [search, setSearch] = useState(filters.search ?? '');
    const [serverSearch, setServerSearch] = useState(filters.search ?? '');
    const firstRender = useRef(true);

    // The input is local so typing stays responsive, but a navigation that
    // changes the term server-side (the back button, or a cleared filter chip)
    // has to win. Adjusted during render rather than in an effect so the stale
    // value never paints.
    if (serverSearch !== (filters.search ?? '')) {
        setServerSearch(filters.search ?? '');
        setSearch(filters.search ?? '');
    }

    const filterFields: AquaFilterField[] = useMemo(
        () => [
            {
                key: 'status',
                label: 'Status',
                anyLabel: 'Any status',
                options: statusOptions,
            },
            {
                key: 'plan',
                label: 'Plan',
                anyLabel: 'Any plan',
                options: planOptions,
            },
        ],
        [planOptions, statusOptions],
    );

    const activeFilters: AquaFilterValues = useMemo(
        () => ({
            status: filters.status ?? '',
            plan: filters.plan ?? '',
        }),
        [filters.plan, filters.status],
    );

    const sort = filters.sort ?? 'organization';
    const direction: SortDirection =
        filters.direction === 'desc' ? 'desc' : 'asc';

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                subscriptions.index().url,
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

    const navigate = (
        nextFilters: AquaFilterValues,
        column = sort,
        nextDirection = direction,
    ) => {
        router.get(
            subscriptions.index().url,
            queryPayload(search, nextFilters, column, nextDirection),
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const exportHref = (format: 'csv' | 'xlsx') =>
        subscriptions.export({
            query: {
                ...queryPayload(search, activeFilters, sort, direction),
                format,
            },
        }).url;

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AquaStatCard
                    label="Active"
                    value={stats.active}
                    icon={CircleCheck}
                />
                <AquaStatCard label="Trial" value={stats.trial} icon={Clock} />
                <AquaStatCard
                    label="Expired"
                    value={stats.expired}
                    icon={CalendarClock}
                />
                <AquaStatCard
                    label="Suspended"
                    value={stats.suspended}
                    icon={CircleSlash}
                />
            </div>

            <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-sm flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search organizations..."
                            className="border-navy-100 pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <AquaFilterPopover
                            fields={filterFields}
                            values={activeFilters}
                            onApply={(next) => navigate(next)}
                            description="Narrow the book of business by standing or plan."
                        />
                        {can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.EXPORT) && (
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
                    fields={filterFields}
                    values={activeFilters}
                    onChange={(next) => navigate(next)}
                    className="mt-3"
                />

                <div className="mt-4 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                <SortableTableHead
                                    column="organization"
                                    label="Organization"
                                    activeColumn={sort}
                                    activeDirection={direction}
                                    onSort={(column, nextDirection) =>
                                        navigate(
                                            activeFilters,
                                            column,
                                            nextDirection,
                                        )
                                    }
                                />
                                <SortableTableHead
                                    column="plan"
                                    label="Plan"
                                    activeColumn={sort}
                                    activeDirection={direction}
                                    onSort={(column, nextDirection) =>
                                        navigate(
                                            activeFilters,
                                            column,
                                            nextDirection,
                                        )
                                    }
                                />
                                <SortableTableHead
                                    column="mrr"
                                    label="MRR"
                                    activeColumn={sort}
                                    activeDirection={direction}
                                    onSort={(column, nextDirection) =>
                                        navigate(
                                            activeFilters,
                                            column,
                                            nextDirection,
                                        )
                                    }
                                />
                                <SortableTableHead
                                    column="status"
                                    label="Status"
                                    activeColumn={sort}
                                    activeDirection={direction}
                                    onSort={(column, nextDirection) =>
                                        navigate(
                                            activeFilters,
                                            column,
                                            nextDirection,
                                        )
                                    }
                                />
                                <SortableTableHead
                                    column="renewal"
                                    label="Renewal"
                                    activeColumn={sort}
                                    activeDirection={direction}
                                    onSort={(column, nextDirection) =>
                                        navigate(
                                            activeFilters,
                                            column,
                                            nextDirection,
                                        )
                                    }
                                />
                                <TableHead className="w-20 text-right text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.data.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-navy-50"
                                >
                                    <TableCell>
                                        <Link
                                            href={row.show_url}
                                            className="block font-semibold text-navy-500 hover:text-aqua-600"
                                        >
                                            {row.organization}
                                        </Link>
                                        <span className="block text-body-4 text-navy-300">
                                            {row.region}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-body-3 text-navy-500">
                                        {row.plan}
                                    </TableCell>
                                    <TableCell className="text-body-3 font-semibold text-navy-500 tabular-nums">
                                        {row.mrr_label}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={row.status} />
                                    </TableCell>
                                    <TableCell className="text-body-3 text-navy-400 tabular-nums">
                                        {row.renewal_label}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <RowActions row={row} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {rows.data.length === 0 && (
                        <div className="px-4 py-16 text-center">
                            <CalendarClock className="mx-auto size-10 text-navy-200" />
                            <h3 className="mt-4 text-sm font-semibold text-navy-500">
                                No subscriptions found
                            </h3>
                            <p className="mt-1 text-body-4 text-navy-300">
                                Adjust your search or filters to see more
                                results.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <DataPagination meta={rows} />
                </div>
            </Card>
        </div>
    );
}

function RowActions({ row }: { row: SubscriptionTrackingRow }) {
    const { can } = usePermission();
    const canEdit = can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.EDIT);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-aqua-600"
                    aria-label={`Actions for ${row.organization}`}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href={row.show_url}>
                        <Eye className="size-4" />
                        View organization
                    </Link>
                </DropdownMenuItem>
                {canEdit && (
                    <DropdownMenuItem
                        onSelect={() =>
                            router.post(row.checkout_url, {}, { preserveScroll: true })
                        }
                    >
                        <RefreshCw className="size-4" />
                        Stripe checkout
                    </DropdownMenuItem>
                )}
                {canEdit && row.on_stripe && !row.on_grace_period && (
                    <DropdownMenuItem
                        onSelect={() =>
                            router.patch(row.cancel_url, {}, { preserveScroll: true })
                        }
                    >
                        Cancel at period end
                    </DropdownMenuItem>
                )}
                {canEdit && row.on_grace_period && (
                    <DropdownMenuItem
                        onSelect={() =>
                            router.patch(row.resume_url, {}, { preserveScroll: true })
                        }
                    >
                        Resume
                    </DropdownMenuItem>
                )}
                {can(PERMISSIONS.SCHOOLS.EDIT) &&
                    row.status_value !== 'suspended' && (
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() =>
                                router.patch(
                                    organizations.status(row.organization_slug)
                                        .url,
                                    { status: 'suspended' },
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <ShieldOff className="size-4" />
                            Suspend
                        </DropdownMenuItem>
                    )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
