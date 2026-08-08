import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformSubscriptions } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformSubscriptionsPage() {
    return (
        <ModuleFixturePage
            title={platformSubscriptions.title}
            subtitle={platformSubscriptions.subtitle}
            columns={platformSubscriptions.columns}
            rows={platformSubscriptions.rows}
            createLabel="Create Plan"
            createPermission={PERMISSIONS.PLATFORM_SUBSCRIPTIONS.CREATE}
            exportPermission={PERMISSIONS.PLATFORM_SUBSCRIPTIONS.EXPORT}
        />
    );
}
