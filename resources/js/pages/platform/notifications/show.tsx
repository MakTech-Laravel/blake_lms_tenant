import { Head } from '@inertiajs/react';
import { NotificationDeliveryReport } from '@/components/aquacert/notifications/notification-delivery-report';
import type { DeliveryReportProps } from '@/components/aquacert/notifications/notification-delivery-report';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import notifications from '@/routes/platform/notifications';
import { PERMISSIONS } from '@/types/permissions';

type PlatformNotificationShowProps = Omit<DeliveryReportProps, 'abilities'>;

export default function PlatformNotificationShow(
    props: PlatformNotificationShowProps,
) {
    const { can } = usePermission();

    return (
        <>
            <Head title={props.notification.title} />

            <NotificationDeliveryReport
                {...props}
                abilities={{
                    send: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.SEND),
                    remove: can(PERMISSIONS.PLATFORM_NOTIFICATIONS.DELETE),
                }}
            />
        </>
    );
}

PlatformNotificationShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Notifications', href: notifications.index() },
        { title: 'Delivery report', href: notifications.index() },
    ],
};
