import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformLocations } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformLocationsPage() {
    return (
        <ModuleFixturePage
            title={platformLocations.title}
            subtitle={platformLocations.subtitle}
            columns={platformLocations.columns}
            rows={platformLocations.rows}
            createLabel="Add Location"
            createPermission={PERMISSIONS.PLATFORM_LOCATIONS.CREATE}
            exportPermission={PERMISSIONS.PLATFORM_LOCATIONS.EXPORT}
        />
    );
}
