import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolNotifications } from '@/data/modules/school-modules';

export default function SchoolNotificationsPage() {
    return (
        <ModuleFixturePage
            title={schoolNotifications.title}
            subtitle={schoolNotifications.subtitle}
            columns={schoolNotifications.columns}
            rows={schoolNotifications.rows}
            createLabel="Send Notification"
        />
    );
}
