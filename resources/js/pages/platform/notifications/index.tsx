import { Head } from '@inertiajs/react';
import { NotificationsManager } from '@/components/aquacert/notifications/notifications-manager';
import type { NotificationFilters } from '@/components/aquacert/notifications/notifications-manager';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import notifications from '@/routes/platform/notifications';
import type {
    NotificationAudienceOption,
    NotificationListItem,
    NotificationModuleRoutes,
    NotificationStats,
    Paginated,
    SelectOption,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface PlatformNotificationsIndexProps {
    notifications: Paginated<NotificationListItem>;
    filters: NotificationFilters;
    stats: NotificationStats;
    routes: NotificationModuleRoutes;
    audienceOptions: NotificationAudienceOption[];
    categoryOptions: SelectOption[];
    priorityOptions: SelectOption[];
    organizationOptions: SelectOption[];
    planOptions: SelectOption[];
    roleOptions: SelectOption[];
}

export default function PlatformNotificationsIndex({
    notifications: paginated,
    filters,
    stats,
    routes,
    audienceOptions,
    categoryOptions,
    priorityOptions,
    organizationOptions,
    planOptions,
    roleOptions,
}: PlatformNotificationsIndexProps) {
    const { can } = usePermission();

    return (
        <>
            <Head title="Notifications & Announcements" />

            <NotificationsManager
                subtitle="Broadcast messages to your ecosystem"
                notifications={paginated}
                filters={filters}
                stats={stats}
                routes={routes}
                abilities={{
                    send: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.SEND),
                    edit: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.EDIT),
                    remove: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.DELETE),
                    view: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.VIEW),
                    export: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.EXPORT),
                }}
                audienceOptions={audienceOptions}
                categoryOptions={categoryOptions}
                priorityOptions={priorityOptions}
                organizationOptions={organizationOptions}
                planOptions={planOptions}
                roleOptions={roleOptions}
            />
        </>
    );
}

PlatformNotificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Notifications', href: notifications.index() },
    ],
};
