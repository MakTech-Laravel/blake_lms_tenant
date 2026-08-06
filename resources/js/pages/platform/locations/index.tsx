import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformLocations } from '@/data/modules/platform-modules';

export default function PlatformLocationsPage() {
    return (
        <ModuleFixturePage
            title={platformLocations.title}
            subtitle={platformLocations.subtitle}
            columns={platformLocations.columns}
            rows={platformLocations.rows}
            createLabel="Add Location"
        />
    );
}
