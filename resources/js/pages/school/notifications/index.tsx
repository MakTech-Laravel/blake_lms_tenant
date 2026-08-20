import { Head } from '@inertiajs/react';
import { NotificationsManager } from '@/components/aquacert/notifications/notifications-manager';
import type { NotificationFilters } from '@/components/aquacert/notifications/notifications-manager';
import { usePermission } from '@/hooks/use-permissions';
import type {
    NotificationAudienceOption,
    NotificationListItem,
    NotificationModuleRoutes,
    NotificationStats,
    Paginated,
    SelectOption,
} from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

interface SchoolNotificationsIndexProps {
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

export default function SchoolNotificationsIndex({
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
}: SchoolNotificationsIndexProps) {
    const { can } = usePermission();

    return (
        <>
            <Head title="Notifications & Announcements" />

            <NotificationsManager
                subtitle="Keep your staff and learners informed"
                notifications={paginated}
                filters={filters}
                stats={stats}
                routes={routes}
                abilities={{
                    send: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.SEND),
                    edit: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.EDIT),
                    remove: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.DELETE),
                    view: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.VIEW),
                    export: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.EXPORT),
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
