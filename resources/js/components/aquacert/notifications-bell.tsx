import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    CheckCheck,
    ExternalLink,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
    headerNotifications,
} from '@/data/header-notifications';
import type { HeaderNotification } from '@/data/header-notifications';
import { cn } from '@/lib/utils';

function resolveNotificationsHref(url: string, schoolSlug?: string): string {
    if (url.startsWith('/platform')) {
        return '/platform/notifications';
    }

    if (url.startsWith('/school/') && schoolSlug) {
        return `/school/${schoolSlug}/notifications`;
    }

    if (url.startsWith('/dashboard')) {
        return '/dashboard/notifications';
    }

    return '#';
}

type NotificationsBellProps = {
    /** Override fixture list (useful in tests / portal-specific feeds). */
    items?: HeaderNotification[];
    /** Override the "View all" destination. */
    viewAllHref?: string;
    className?: string;
};

export function NotificationsBell({
    items = headerNotifications,
    viewAllHref,
    className,
}: NotificationsBellProps) {
    const page = usePage();
    const schoolSlug = page.props.school?.slug;

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(items);

    const unreadCount = useMemo(
        () => notifications.filter((item) => !item.read).length,
        [notifications],
    );

    const resolvedViewAll =
        viewAllHref ?? resolveNotificationsHref(page.url, schoolSlug);

    const markAllRead = () => {
        setNotifications((current) =>
            current.map((item) => ({ ...item, read: true })),
        );
    };

    const markRead = (id: string) => {
        setNotifications((current) =>
            current.map((item) =>
                item.id === id ? { ...item, read: true } : item,
            ),
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
                    aria-label="Notifications"
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
                    {notifications.length === 0 ? (
                        <li className="px-4 py-10 text-center text-body-3 text-navy-300">
                            You&apos;re all caught up.
                        </li>
                    ) : (
                        notifications.map((item) => (
                            <li
                                key={item.id}
                                className={cn(
                                    'border-b border-navy-50 last:border-b-0',
                                    !item.read && 'bg-aqua-50/40',
                                )}
                            >
                                <div className="flex gap-3 px-4 py-3">
                                    <span
                                        className={cn(
                                            'mt-1.5 size-2 shrink-0 rounded-full',
                                            item.read
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
                                            {item.description}
                                        </p>
                                        <p className="mt-1 text-caption-1 text-navy-200">
                                            {item.time}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-0.5">
                                        {!item.read && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-navy-300 hover:text-aqua-600"
                                                        onClick={() =>
                                                            markRead(item.id)
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
                                        {item.href ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-navy-300 hover:text-aqua-600"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => {
                                                                markRead(
                                                                    item.id,
                                                                );
                                                                setOpen(false);
                                                            }}
                                                            aria-label={`Open ${item.title}`}
                                                        >
                                                            <ExternalLink className="size-3.5" />
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Open
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
                        href={resolvedViewAll}
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
