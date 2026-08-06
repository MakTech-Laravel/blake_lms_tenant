import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformNotifications } from '@/data/modules/platform-modules';

export default function PlatformNotificationsPage() {
    return (
        <ModuleFixturePage
            title={platformNotifications.title}
            subtitle={platformNotifications.subtitle}
            columns={platformNotifications.columns}
            rows={platformNotifications.rows}
            createLabel="Send Notification"
        />
    );
}
