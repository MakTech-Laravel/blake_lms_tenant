import { Head } from '@inertiajs/react';
import { NotificationDeliveryReport } from '@/components/aquacert/notifications/notification-delivery-report';
import type { DeliveryReportProps } from '@/components/aquacert/notifications/notification-delivery-report';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';

type SchoolNotificationShowProps = Omit<DeliveryReportProps, 'abilities'>;

export default function SchoolNotificationShow(
    props: SchoolNotificationShowProps,
) {
    const { can } = usePermission();

    return (
        <>
            <Head title={props.notification.title} />

            <NotificationDeliveryReport
                {...props}
                abilities={{
                    send: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.SEND),
                    remove: can(PERMISSIONS.SCHOOL_NOTIFICATIONS.DELETE),
                }}
            />
        </>
    );
}
