import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import type { ModuleRow } from '@/data/modules/platform-modules';
import { schoolLocations } from '@/data/modules/school-modules';

type Props = {
    locations?: ModuleRow[];
};

export default function SchoolLocationsPage({ locations }: Props) {
    const rows = locations && locations.length > 0 ? locations : schoolLocations.rows;

    return (
        <ModuleFixturePage
            title={schoolLocations.title}
            subtitle={schoolLocations.subtitle}
            columns={schoolLocations.columns}
            rows={rows}
            createLabel="Add Location"
        />
    );
}
