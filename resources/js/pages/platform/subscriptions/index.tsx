import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformSubscriptions } from '@/data/modules/platform-modules';

export default function PlatformSubscriptionsPage() {
    return (
        <ModuleFixturePage
            title={platformSubscriptions.title}
            subtitle={platformSubscriptions.subtitle}
            columns={platformSubscriptions.columns}
            rows={platformSubscriptions.rows}
            createLabel="Create Plan"
        />
    );
}
