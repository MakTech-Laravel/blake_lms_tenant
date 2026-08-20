import { Link, router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Bell,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    Eye,
    FileEdit,
    FileSpreadsheet,
    FileText,
    Loader2,
    Mail,
    Megaphone,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Send,
    Trash2,
    Users,
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
import { AnnouncementBuilderDialog } from '@/components/aquacert/notifications/announcement-builder-dialog';
import { NotificationIcon } from '@/components/aquacert/notifications/notification-icon';
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
import { cn } from '@/lib/utils';
import type {
    NotificationAudienceOption,
    NotificationListItem,
    NotificationModuleRoutes,
    NotificationStats,
    Paginated,
    SelectOption,
} from '@/types/admin';

export type NotificationFilters = {
    search: string;
    status: string;
    category: string;
    audience: string;
    priority: string;
    sort: string;
    direction: 'asc' | 'desc';
};

/** What the caller is allowed to do, resolved from its own permission keys. */
export type NotificationAbilities = {
    send: boolean;
    edit: boolean;
    remove: boolean;
    view: boolean;
    export: boolean;
};

type NotificationsManagerProps = {
    subtitle: string;
    notifications: Paginated<NotificationListItem>;
    filters: NotificationFilters;
    stats: NotificationStats;
    routes: NotificationModuleRoutes;
    abilities: NotificationAbilities;
    audienceOptions: NotificationAudienceOption[];
    categoryOptions: SelectOption[];
    priorityOptions: SelectOption[];
    organizationOptions: SelectOption[];
    planOptions: SelectOption[];
    roleOptions: SelectOption[];
};

/**
 * The Notifications & Announcements screen, shared by the platform and school
 * modules.
 *
 * The two differ only in scope and permission keys, both of which arrive as
 * props: every row already carries its own action URLs, so this component never
 * needs to know which route set it is looking at.
 *
 * A card list rather than a table, deliberately. An announcement's identity is
 * its message, which needs room to be read; a table would have to truncate the
 * one column that matters into a cell.
 */
export function NotificationsManager({
    subtitle,
    notifications,
    filters,
    stats,
    routes,
    abilities,
    audienceOptions,
    categoryOptions,
    priorityOptions,
    organizationOptions,
    planOptions,
    roleOptions,
}: NotificationsManagerProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [serverSearch, setServerSearch] = useState(filters.search ?? '');
    const [composing, setComposing] = useState(false);
    const [editing, setEditing] = useState<NotificationListItem | null>(null);
    const firstRender = useRef(true);
    // The last term this component asked the server for, so its echo can be told
    // apart from the term changing for some other reason. State rather than a
    // ref because the comparison below happens while rendering.
    const [submitted, setSubmitted] = useState(filters.search ?? '');
    const pendingSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Adopt the server's value when it changes underneath us (a filter chip
    // cleared, the back button pressed) without an effect that would re-render.
    // Our own echo is ignored: it arrives a request later than the keystrokes
    // that caused it, and overwriting the box would delete whatever was typed
    // while the response was in flight.
    if (serverSearch !== (filters.search ?? '')) {
        setServerSearch(filters.search ?? '');

        if ((filters.search ?? '') !== submitted) {
            setSearch(filters.search ?? '');
        }
    }

    const cancelPendingSearch = () => {
        if (pendingSearch.current !== null) {
            clearTimeout(pendingSearch.current);
            pendingSearch.current = null;
        }
    };

    const filterFields: AquaFilterField[] = useMemo(
        () => [
            {
                key: 'category',
                label: 'Category',
                anyLabel: 'Any category',
                options: categoryOptions,
            },
            {
                key: 'priority',
                label: 'Priority',
                anyLabel: 'Any priority',
                options: priorityOptions,
            },
            {
                key: 'audience',
                label: 'Audience',
                anyLabel: 'Any audience',
                options: audienceOptions.map(({ value, label }) => ({
                    value,
                    label,
                })),
            },
        ],
        [categoryOptions, priorityOptions, audienceOptions],
    );

    const activeFilters: AquaFilterValues = useMemo(
        () => ({
            category: filters.category ?? '',
            priority: filters.priority ?? '',
            audience: filters.audience ?? '',
        }),
        [filters.category, filters.priority, filters.audience],
    );

    const query = (
        next: Partial<{
            search: string;
            status: string;
            advanced: AquaFilterValues;
        }> = {},
    ) => {
        const advanced = next.advanced ?? activeFilters;
        const term = next.search ?? search;
        const status = next.status ?? filters.status ?? '';

        return {
            search: term || undefined,
            status: status || undefined,
            category: advanced.category || undefined,
            priority: advanced.priority || undefined,
            audience: advanced.audience || undefined,
        };
    };

    const visit = (payload: ReturnType<typeof query>) => {
        // A queued search still holds the tab and filters as they were when the
        // last keystroke landed, so letting it fire after this would undo the
        // choice being made here.
        cancelPendingSearch();
        setSubmitted(payload.search ?? '');

        router.get(routes.index, payload, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        pendingSearch.current = setTimeout(() => {
            const payload = query({ search });
            setSubmitted(payload.search ?? '');

            router.get(routes.index, payload, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return cancelPendingSearch;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- other filters apply immediately
    }, [search]);

    const exportHref = (format: 'csv' | 'xlsx') => {
        const params = new URLSearchParams({ format });

        for (const [key, value] of Object.entries(query())) {
            if (value) {
                params.set(key, String(value));
            }
        }

        return `${routes.export}?${params.toString()}`;
    };

    // An empty list means something different when a filter is narrowing it, so
    // the copy and the call to action both turn on this rather than on search
    // alone: a category with no matches is not an empty module.
    const isFiltered =
        Boolean(filters.search || filters.status) ||
        Object.values(activeFilters).some(Boolean);

    const compose = () => {
        setEditing(null);
        setComposing(true);
    };

    const edit = (notification: NotificationListItem) => {
        setEditing(notification);
        setComposing(true);
    };

    return (
        <>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Notifications & Announcements"
                    subtitle={subtitle}
                    actions={
                        abilities.send ? (
                            <Button
                                type="button"
                                onClick={compose}
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                <Megaphone className="size-4" />
                                New Announcement
                            </Button>
                        ) : null
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <AquaStatCard
                        label="Sent"
                        value={stats.sent}
                        icon={CheckCircle2}
                    />
                    <AquaStatCard
                        label="Scheduled"
                        value={stats.scheduled}
                        icon={Clock}
                    />
                    <AquaStatCard
                        label="Drafts"
                        value={stats.draft}
                        icon={FileEdit}
                    />
                    <AquaStatCard
                        label="Archived"
                        value={stats.archived}
                        icon={Archive}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1 border-b border-navy-50">
                    {STATUS_TABS.map((tab) => {
                        const isActive = (filters.status ?? '') === tab.value;

                        return (
                            <button
                                key={tab.value || 'all'}
                                type="button"
                                onClick={() =>
                                    visit(query({ status: tab.value }))
                                }
                                className={cn(
                                    '-mb-px border-b-2 px-3 py-2.5 text-label-3 font-medium transition-colors',
                                    isActive
                                        ? 'border-navy-500 text-navy-500'
                                        : 'border-transparent text-aqua-600 hover:border-navy-100 hover:text-navy-500',
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {tab.label}
                                {tab.count(stats) > 0 && (
                                    <span className="ml-1.5 text-caption-1 text-navy-200 tabular-nums">
                                        {tab.count(stats)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-sm flex-1">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search announcements..."
                            aria-label="Search announcements"
                            className="border-navy-100 bg-white pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <AquaFilterPopover
                            fields={filterFields}
                            values={activeFilters}
                            onApply={(next) => visit(query({ advanced: next }))}
                            description="Narrow announcements by what they are about, how urgent they are, or who they went to."
                        />

                        {abilities.export && (
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
                    onChange={(next) => visit(query({ advanced: next }))}
                />

                {notifications.data.length === 0 ? (
                    <Card className="border-navy-50 bg-white py-16 text-center shadow-sm">
                        <Bell className="mx-auto size-10 text-navy-200" />
                        <h3 className="mt-4 text-sm font-semibold text-navy-500">
                            No announcements here
                        </h3>
                        <p className="mt-1 text-body-4 text-navy-300">
                            {isFiltered
                                ? 'Adjust your search or filters to see more results.'
                                : 'Compose one to reach your organizations, staff, and teachers.'}
                        </p>
                        {abilities.send && !isFiltered && (
                            <div className="mt-5">
                                <Button
                                    type="button"
                                    onClick={compose}
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Plus className="size-4" />
                                    New Announcement
                                </Button>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                abilities={abilities}
                                onEdit={edit}
                            />
                        ))}
                    </div>
                )}

                {notifications.total > 0 && (
                    <Card className="overflow-hidden border-navy-50 bg-white p-0 shadow-sm">
                        <DataPagination meta={notifications} />
                    </Card>
                )}
            </div>

            {/* Editing and sending are separate permissions, so a role that may
                rewrite a draft but not broadcast it still needs the composer. */}
            {(abilities.send || abilities.edit) && (
                <AnnouncementBuilderDialog
                    open={composing}
                    onOpenChange={setComposing}
                    routes={routes}
                    audienceOptions={audienceOptions}
                    categoryOptions={categoryOptions}
                    priorityOptions={priorityOptions}
                    organizationOptions={organizationOptions}
                    planOptions={planOptions}
                    roleOptions={roleOptions}
                    editing={editing}
                />
            )}
        </>
    );
}

const STATUS_TABS: {
    value: string;
    label: string;
    count: (stats: NotificationStats) => number;
}[] = [
    { value: '', label: 'All', count: (stats) => stats.total },
    { value: 'draft', label: 'Draft', count: (stats) => stats.draft },
    {
        value: 'scheduled',
        label: 'Scheduled',
        count: (stats) => stats.scheduled,
    },
    { value: 'sent', label: 'Sent', count: (stats) => stats.sent },
    { value: 'archived', label: 'Archived', count: (stats) => stats.archived },
];

type NotificationRowProps = {
    notification: NotificationListItem;
    abilities: NotificationAbilities;
    onEdit: (notification: NotificationListItem) => void;
};

function NotificationRow({
    notification,
    abilities,
    onEdit,
}: NotificationRowProps) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [working, setWorking] = useState(false);

    const act = (method: 'post' | 'patch', url: string) => {
        setWorking(true);
        router[method](
            url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setWorking(false),
            },
        );
    };

    return (
        <>
            <Card className="border-navy-50 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <NotificationIcon category={notification.category_value} />

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {abilities.view ? (
                                <Link
                                    href={notification.show_url}
                                    className="font-semibold text-navy-500 hover:text-aqua-700"
                                >
                                    {notification.title}
                                </Link>
                            ) : (
                                <span className="font-semibold text-navy-500">
                                    {notification.title}
                                </span>
                            )}
                            <StatusBadge status={notification.status} />
                            {notification.priority_elevated && (
                                <StatusBadge status={notification.priority} />
                            )}
                        </div>

                        <p className="mt-1 text-body-4 text-navy-300">
                            {notification.excerpt}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption-1 text-navy-300">
                            <span className="flex items-center gap-1">
                                <Users className="size-3.5 text-navy-200" />
                                {notification.audience_label}
                            </span>
                            <span className="tabular-nums">
                                {notification.date_label}
                            </span>
                            {notification.sends_email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="size-3.5 text-navy-200" />
                                    Email
                                </span>
                            )}
                            {notification.recipients_count > 0 && (
                                <span className="tabular-nums">
                                    {notification.read_count} of{' '}
                                    {notification.recipients_count} read
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {abilities.edit && notification.is_editable && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(notification)}
                                className="border-navy-100 text-navy-400"
                            >
                                <Pencil className="size-3.5" />
                                Edit
                            </Button>
                        )}

                        {abilities.send && notification.is_sendable && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={working}
                                onClick={() =>
                                    act('post', notification.send_url)
                                }
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                {working ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Send className="size-3.5" />
                                )}
                                Send
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-aqua-600"
                                    aria-label={`Actions for ${notification.title}`}
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                                {abilities.view && (
                                    <DropdownMenuItem asChild>
                                        <Link href={notification.show_url}>
                                            <Eye className="size-4" />
                                            Delivery report
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {abilities.edit &&
                                    (notification.is_archived ? (
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                act(
                                                    'patch',
                                                    notification.unarchive_url,
                                                )
                                            }
                                        >
                                            <ArchiveRestore className="size-4" />
                                            Restore
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                act(
                                                    'patch',
                                                    notification.archive_url,
                                                )
                                            }
                                        >
                                            <Archive className="size-4" />
                                            Archive
                                        </DropdownMenuItem>
                                    ))}
                                {abilities.remove && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() =>
                                            setConfirmingDelete(true)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Card>

            {/* Kept outside the menu so closing the menu does not unmount the dialog. */}
            <ConfirmDeleteDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                description={
                    <>
                        Delete <strong>{notification.title}</strong>?
                        {notification.recipients_count > 0
                            ? ` This also removes it from the ${notification.recipients_count} inboxes it was delivered to.`
                            : ' This draft has not been delivered to anyone.'}
                    </>
                }
                processing={working}
                onConfirm={() => {
                    setWorking(true);
                    router.delete(notification.destroy_url, {
                        preserveScroll: true,
                        onFinish: () => setWorking(false),
                    });
                }}
            />
        </>
    );
}
