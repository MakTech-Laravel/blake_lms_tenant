import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformNotifications } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformNotificationsPage() {
    return (
        <ModuleFixturePage
            title={platformNotifications.title}
            subtitle={platformNotifications.subtitle}
            columns={platformNotifications.columns}
            rows={platformNotifications.rows}
            createLabel="Send Notification"
            createPermission={PERMISSIONS.PLATFORM_NOTIFICATIONS.SEND}
            exportPermission={PERMISSIONS.PLATFORM_NOTIFICATIONS.EXPORT}
        />
    );
}
