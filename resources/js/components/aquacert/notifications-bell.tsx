import { Link, router, useHttp, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, ExternalLink, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    index as inbox,
    read_all,
    recent,
} from '@/routes/notifications';
import type { InboxNotification } from '@/types/admin';

type NotificationsBellProps = {
    className?: string;
};

type RecentResponse = {
    items: InboxNotification[];
    unread_count: number;
};

/**
 * The header bell: this user's own recent notifications, from the server.
 *
 * The badge count rides along as a shared Inertia prop so it is correct on first
 * paint and after any visit, but the list is only fetched when the popover opens.
 * Most page loads never open it, and an unopened bell should not cost a query on
 * every request.
 *
 * Mark-as-read is applied locally before the request resolves. The result is
 * never in doubt — the row is this user's own receipt — and waiting for a round
 * trip to remove a dot makes the control feel broken.
 */
export function NotificationsBell({ className }: NotificationsBellProps) {
    const page = usePage();
    const sharedCount = page.props.notifications?.unread_count ?? 0;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<InboxNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(sharedCount);
    const [lastSharedCount, setLastSharedCount] = useState(sharedCount);

    const feed = useHttp<Record<string, never>, RecentResponse>({});

    // The shared prop wins whenever it changes: an optimistic decrement here is
    // only a stand-in until the server's own count arrives with the next visit.
    // Adjusted during render rather than in an effect so the badge never paints
    // a number the server has already superseded.
    if (lastSharedCount !== sharedCount) {
        setLastSharedCount(sharedCount);
        setUnreadCount(sharedCount);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        feed.get(recent().url, {
            onSuccess: (response) => {
                setItems(response.items ?? []);
                setUnreadCount(response.unread_count ?? 0);
            },
        }).catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the http helper is stable
    }, [open]);

    const markRead = (notification: InboxNotification) => {
        if (notification.is_read) {
            return;
        }

        setItems((current) =>
            current.map((item) =>
                item.id === notification.id ? { ...item, is_read: true } : item,
            ),
        );
        setUnreadCount((current) => Math.max(current - 1, 0));

        router.patch(
            notification.read_url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    /**
     * Follow an announcement's action link, but not before its read receipt has
     * been recorded. Letting the browser navigate while the request is in flight
     * aborts it, and the notification stays unread even though the dot cleared.
     */
    const openAction = (notification: InboxNotification, href: string) => {
        setOpen(false);

        if (notification.is_read) {
            window.location.href = href;

            return;
        }

        setItems((current) =>
            current.map((item) =>
                item.id === notification.id ? { ...item, is_read: true } : item,
            ),
        );
        setUnreadCount((current) => Math.max(current - 1, 0));

        router.patch(
            notification.read_url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    window.location.href = href;
                },
            },
        );
    };

    const markAllRead = () => {
        setItems((current) => current.map((item) => ({ ...item, is_read: true })));
        setUnreadCount(0);

        router.patch(
            read_all().url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn('relative text-navy-400', className)}
                    aria-label={
                        unreadCount > 0
                            ? `Notifications, ${unreadCount} unread`
                            : 'Notifications'
                    }
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[min(100vw-1.5rem,22.5rem)] border-navy-50 p-0 shadow-lg"
            >
                <div className="flex items-center justify-between gap-2 border-b border-navy-50 px-4 py-3">
                    <h2 className="text-label-1 font-semibold text-navy-500">
                        Notifications
                    </h2>
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-navy-300 hover:text-aqua-600"
                                    disabled={unreadCount === 0}
                                    onClick={markAllRead}
                                    aria-label="Mark all as read"
                                >
                                    <CheckCheck className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Mark all as read</TooltipContent>
                        </Tooltip>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-navy-300 hover:text-navy-500"
                            onClick={() => setOpen(false)}
                            aria-label="Close notifications"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                <ul className="max-h-80 overflow-y-auto">
                    {feed.processing && items.length === 0 ? (
                        <li className="flex items-center justify-center gap-2 px-4 py-10 text-body-3 text-navy-300">
                            <Loader2 className="size-4 animate-spin" />
                            Loading...
                        </li>
                    ) : items.length === 0 ? (
                        <li className="px-4 py-10 text-center text-body-3 text-navy-300">
                            You&apos;re all caught up.
                        </li>
                    ) : (
                        items.map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    'border-b border-navy-50 last:border-b-0',
                                    !item.is_read && 'bg-aqua-50/40',
                                )}
                            >
                                <div className="flex gap-3 px-4 py-3">
                                    <span
                                        className={cn(
                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                            item.is_read
                                                ? 'bg-transparent'
                                                : 'bg-aqua-500',
                                        )}
                                        aria-hidden
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-label-2 font-semibold text-navy-500">
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-body-4 text-navy-300">
                                            {item.excerpt}
                                        </p>
                                        <p className="mt-1 text-caption-1 text-navy-200">
                                            {item.received_relative}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-0.5">
                                        {!item.is_read && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-navy-300 hover:text-aqua-600"
                                                        onClick={() =>
                                                            markRead(item)
                                                        }
                                                        aria-label={`Mark ${item.title} as read`}
                                                    >
                                                        <Check className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Mark as read
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        {item.action_url ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-navy-300 hover:text-aqua-600"
                                                        asChild
                                                    >
                                                        <a
                                                            href={
                                                                item.action_url
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.preventDefault();
                                                                openAction(
                                                                    item,
                                                                    item.action_url!,
                                                                );
                                                            }}
                                                            aria-label={
                                                                item.action_label ??
                                                                `Open ${item.title}`
                                                            }
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {item.action_label ??
                                                        'Open'}
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>

                <div className="border-t border-navy-50 px-4 py-3 text-center">
                    <Link
                        href={inbox()}
                        className="text-label-3 font-semibold text-aqua-600 hover:text-aqua-700"
                        onClick={() => setOpen(false)}
                    >
                        View all notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
