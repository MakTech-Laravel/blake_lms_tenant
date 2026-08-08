import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Bell,
    CheckCheck,
    Inbox,
    Mail,
    MailOpen,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DataPagination } from '@/components/admin/data-pagination';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { NotificationIcon } from '@/components/aquacert/notifications/notification-icon';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { index as inboxIndex, read_all } from '@/routes/notifications';
import type { InboxNotification, Paginated } from '@/types/admin';

interface InboxProps {
    notifications: Paginated<InboxNotification>;
    filters: { tab: string; search: string };
    stats: { total: number; unread: number; archived: number };
}

const TABS = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'archived', label: 'Archived' },
];

export default function NotificationsInbox({
    notifications: paginated,
    filters,
    stats,
}: InboxProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                inboxIndex().url,
                { tab: filters.tab, search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, filters.tab]);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Notifications" />

            <AquaPageHeader
                title="Notifications"
                subtitle="Everything sent your way"
                actions={
                    stats.unread > 0 ? (
                        <Button
                            type="button"
                            onClick={() =>
                                router.patch(
                                    read_all().url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className="bg-navy-500 text-white hover:bg-navy-600"
                        >
                            <CheckCheck className="size-4" />
                            Mark all read
                        </Button>
                    ) : undefined
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <AquaStatCard
                    label="Total"
                    value={stats.total}
                    icon={Inbox}
                />
                <AquaStatCard
                    label="Unread"
                    value={stats.unread}
                    icon={Bell}
                />
                <AquaStatCard
                    label="Archived"
                    value={stats.archived}
                    icon={Archive}
                />
            </div>

            <Card className="gap-0 overflow-hidden border-navy-50 bg-white p-0 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 border-b border-navy-50 px-4 pt-3">
                    {TABS.map((tab) => {
                        const isActive = filters.tab === tab.value;

                        return (
                            <Link
                                key={tab.value}
                                href={inboxIndex().url}
                                data={{
                                    tab: tab.value,
                                    search: search || undefined,
                                }}
                                preserveScroll
                                className={cn(
                                    '-mb-px border-b-2 px-3 py-2.5 text-label-3 font-medium transition-colors',
                                    isActive
                                        ? 'border-navy-500 text-navy-500'
                                        : 'border-transparent text-aqua-600 hover:text-navy-500',
                                )}
                            >
                                {tab.label}
                                {tab.value === 'unread' && stats.unread > 0 && (
                                    <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-caption-2 font-bold text-white">
                                        {stats.unread}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-b border-navy-50 p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search notifications..."
                            className="h-10 border-navy-100 pl-9"
                        />
                    </div>
                </div>

                {paginated.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                        <span className="flex size-12 items-center justify-center rounded-full bg-aqua-50 text-aqua-500">
                            <Bell className="size-6" />
                        </span>
                        <p className="font-semibold text-navy-500">
                            {filters.search
                                ? 'No notifications match your search'
                                : filters.tab === 'unread'
                                  ? "You're all caught up"
                                  : filters.tab === 'archived'
                                    ? 'Nothing archived'
                                    : 'No notifications yet'}
                        </p>
                        <p className="max-w-sm text-body-4 text-navy-300">
                            {filters.tab === 'archived'
                                ? 'Notifications you archive are kept here so your inbox stays clear.'
                                : 'Announcements sent to you will appear here.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-navy-50">
                            {paginated.data.map((notification) => (
                                <InboxRow
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))}
                        </ul>

                        <DataPagination meta={paginated} />
                    </>
                )}
            </Card>
        </div>
    );
}

function InboxRow({ notification }: { notification: InboxNotification }) {
    const patch = (url: string) => router.patch(url, {}, { preserveScroll: true });

    return (
        <li
            className={cn(
                'flex gap-3 px-4 py-4 transition-colors sm:px-5',
                notification.is_read ? 'bg-white' : 'bg-aqua-50/40',
            )}
        >
            <NotificationIcon category={notification.category_value} />

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {!notification.is_read && (
                        <span className="size-2 shrink-0 rounded-full bg-aqua-500" />
                    )}
                    <h3
                        className={cn(
                            'text-label-2 text-navy-500',
                            notification.is_read
                                ? 'font-medium'
                                : 'font-semibold',
                        )}
                    >
                        {notification.title}
                    </h3>
                    {notification.priority_elevated && (
                        <StatusBadge status={notification.priority} />
                    )}
                </div>

                <p className="mt-1 text-body-3 whitespace-pre-line text-navy-400">
                    {notification.body}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-1 text-navy-300">
                    <span>{notification.sender}</span>
                    <span aria-hidden>·</span>
                    <span>{notification.category}</span>
                    <span aria-hidden>·</span>
                    <span title={notification.received_label}>
                        {notification.received_relative}
                    </span>
                    {notification.is_read && notification.read_at_label && (
                        <>
                            <span aria-hidden>·</span>
                            <span>Read {notification.read_at_label}</span>
                        </>
                    )}
                </div>

                {notification.action_label && notification.action_url && (
                    <a
                        href={notification.action_url}
                        className="mt-3 inline-flex rounded-md bg-aqua-500 px-3 py-1.5 text-caption-1 font-semibold text-white hover:bg-aqua-600"
                    >
                        {notification.action_label}
                    </a>
                )}
            </div>

            <div className="flex shrink-0 items-start gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={
                        notification.is_read
                            ? 'Mark as unread'
                            : 'Mark as read'
                    }
                    onClick={() =>
                        patch(
                            notification.is_read
                                ? notification.unread_url
                                : notification.read_url,
                        )
                    }
                    className="size-8 text-navy-300 hover:bg-aqua-50 hover:text-navy-500"
                >
                    {notification.is_read ? (
                        <Mail className="size-4" />
                    ) : (
                        <MailOpen className="size-4" />
                    )}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title={
                        notification.is_archived
                            ? 'Move back to inbox'
                            : 'Archive'
                    }
                    onClick={() =>
                        patch(
                            notification.is_archived
                                ? notification.unarchive_url
                                : notification.archive_url,
                        )
                    }
                    className="size-8 text-navy-300 hover:bg-aqua-50 hover:text-navy-500"
                >
                    {notification.is_archived ? (
                        <ArchiveRestore className="size-4" />
                    ) : (
                        <Archive className="size-4" />
                    )}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Remove from my notifications"
                    onClick={() =>
                        router.delete(notification.destroy_url, {
                            preserveScroll: true,
                        })
                    }
                    className="size-8 text-navy-300 hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </li>
    );
}
