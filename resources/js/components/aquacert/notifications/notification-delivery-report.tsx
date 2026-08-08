import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Mail,
    MailOpen,
    Send,
    Trash2,
    Users,
} from 'lucide-react';
import { DataPagination } from '@/components/admin/data-pagination';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { NotificationIcon } from '@/components/aquacert/notifications/notification-icon';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
    NotificationListItem,
    NotificationModuleRoutes,
    NotificationRecipientRow,
    Paginated,
    SelectOption,
} from '@/types/admin';

export type DeliveryReportProps = {
    notification: NotificationListItem;
    audienceSelection: SelectOption[];
    recipients: Paginated<NotificationRecipientRow>;
    filters: { read: string };
    routes: NotificationModuleRoutes;
    abilities: { send: boolean; remove: boolean };
};

const READ_TABS = [
    { value: '', label: 'Everyone' },
    { value: 'unread', label: 'Not yet read' },
    { value: 'read', label: 'Read' },
];

/**
 * Who an announcement reached and who has actually opened it.
 *
 * A separate page rather than a modal: the recipient list is paginated and can
 * run to hundreds of rows, and the author's next question after "how many read
 * it" is usually "which of them didn't", which needs filtering and space.
 *
 * Recipients who deleted their own copy are still listed, marked as removed. The
 * announcement was delivered to them, and hiding that would make the counts look
 * wrong for no reason the author could discover.
 */
export function NotificationDeliveryReport({
    notification,
    audienceSelection,
    recipients,
    filters,
    routes,
    abilities,
}: DeliveryReportProps) {
    const unread = Math.max(
        notification.recipients_count - notification.read_count,
        0,
    );

    const readRate =
        notification.recipients_count > 0
            ? Math.round(
                  (notification.read_count / notification.recipients_count) *
                      100,
              )
            : 0;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div>
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-2 mb-2 text-navy-300 hover:text-navy-500"
                >
                    <Link href={routes.index}>
                        <ArrowLeft className="size-4" />
                        Back to announcements
                    </Link>
                </Button>

                <AquaPageHeader
                    title={notification.title}
                    subtitle={`${notification.category} · sent by ${notification.sender}`}
                    actions={
                        <div className="flex items-center gap-2">
                            {abilities.send && notification.is_sendable && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.post(
                                            notification.send_url,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className="bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Send className="size-4" />
                                    Send now
                                </Button>
                            )}
                            {abilities.remove && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.delete(notification.destroy_url)
                                    }
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AquaStatCard
                    label="Recipients"
                    value={notification.recipients_count}
                    icon={Users}
                />
                <AquaStatCard
                    label="Read"
                    value={notification.read_count}
                    icon={MailOpen}
                    trend={
                        notification.recipients_count > 0
                            ? `${readRate}%`
                            : undefined
                    }
                    trendTone={readRate >= 50 ? 'up' : 'neutral'}
                />
                <AquaStatCard label="Unread" value={unread} icon={Mail} />
                <AquaStatCard
                    label="Status"
                    value={notification.status}
                    icon={CheckCircle2}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-navy-50 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="flex gap-3">
                        <NotificationIcon
                            category={notification.category_value}
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-semibold text-navy-500">
                                    {notification.title}
                                </h2>
                                <StatusBadge status={notification.status} />
                                {notification.priority_elevated && (
                                    <StatusBadge
                                        status={notification.priority}
                                    />
                                )}
                            </div>
                            <p className="mt-2 text-body-3 whitespace-pre-line text-navy-400">
                                {notification.body}
                            </p>
                            {notification.action_label &&
                                notification.action_url && (
                                    <a
                                        href={notification.action_url}
                                        className="mt-3 inline-flex rounded-md bg-aqua-500 px-3 py-1.5 text-caption-1 font-semibold text-white hover:bg-aqua-600"
                                    >
                                        {notification.action_label}
                                    </a>
                                )}
                        </div>
                    </div>
                </Card>

                <Card className="gap-0 border-navy-50 bg-white p-5 shadow-sm">
                    <h3 className="text-label-2 font-semibold text-navy-500">
                        Delivery
                    </h3>
                    <dl className="mt-3 space-y-3 text-body-4">
                        <DetailRow
                            label="Audience"
                            value={notification.audience_label}
                        />
                        {audienceSelection.length > 0 && (
                            <div>
                                <dt className="text-navy-300">Targeted</dt>
                                <dd className="mt-1 flex flex-wrap gap-1.5">
                                    {audienceSelection.map((option) => (
                                        <Badge
                                            key={option.value}
                                            variant="outline"
                                            className="border-aqua-200 bg-aqua-50 text-caption-1 font-medium text-aqua-700"
                                        >
                                            {option.label}
                                        </Badge>
                                    ))}
                                </dd>
                            </div>
                        )}
                        <DetailRow
                            label="Channels"
                            value={notification.channel_label}
                        />
                        <DetailRow
                            label={
                                notification.sent_label ? 'Sent' : 'Scheduled'
                            }
                            value={
                                notification.sent_label ??
                                notification.scheduled_at ??
                                'Not scheduled'
                            }
                        />
                        {notification.organization && (
                            <DetailRow
                                label="Organization"
                                value={notification.organization}
                            />
                        )}
                    </dl>
                </Card>
            </div>

            <Card className="gap-0 overflow-hidden border-navy-50 bg-white p-0 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 border-b border-navy-50 px-4 pt-3">
                    {READ_TABS.map((tab) => {
                        const isActive = (filters.read ?? '') === tab.value;

                        return (
                            <Link
                                key={tab.value || 'all'}
                                href={notification.show_url}
                                data={tab.value ? { read: tab.value } : {}}
                                preserveScroll
                                className={cn(
                                    '-mb-px border-b-2 px-3 py-2.5 text-label-3 font-medium transition-colors',
                                    isActive
                                        ? 'border-navy-500 text-navy-500'
                                        : 'border-transparent text-aqua-600 hover:text-navy-500',
                                )}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {recipients.total === 0 ? (
                    <p className="px-4 py-14 text-center text-body-4 text-navy-300">
                        {notification.recipients_count === 0
                            ? 'This announcement has not been sent yet, so it has no recipients.'
                            : 'Nobody matches this filter.'}
                    </p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                            Recipient
                                        </TableHead>
                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                            Type
                                        </TableHead>
                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                            Read
                                        </TableHead>
                                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                            Email
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recipients.data.map((recipient) => (
                                        <TableRow
                                            key={recipient.id}
                                            className="border-navy-50"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-500 text-caption-1 font-bold text-white">
                                                        {recipient.initials}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-medium text-navy-500">
                                                            {recipient.name}
                                                            {recipient.removed && (
                                                                <span className="ml-2 text-caption-1 font-normal text-navy-200">
                                                                    removed
                                                                    their copy
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="block truncate text-body-4 text-navy-300">
                                                            {recipient.email}
                                                        </span>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-body-3 text-navy-400">
                                                {recipient.type}
                                            </TableCell>
                                            <TableCell>
                                                {recipient.is_read ? (
                                                    <span className="text-body-4 text-navy-400 tabular-nums">
                                                        {
                                                            recipient.read_at_label
                                                        }
                                                    </span>
                                                ) : (
                                                    <StatusBadge status="Pending" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-body-4 text-navy-300">
                                                    {recipient.emailed
                                                        ? 'Sent'
                                                        : '—'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <DataPagination meta={recipients} />
                    </>
                )}
            </Card>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-navy-300">{label}</dt>
            <dd className="mt-0.5 font-medium text-navy-500">{value}</dd>
        </div>
    );
}
