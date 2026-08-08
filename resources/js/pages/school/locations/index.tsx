import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import type { ModuleRow } from '@/data/modules/platform-modules';
import { schoolLocations } from '@/data/modules/school-modules';
import { PERMISSIONS } from '@/types/permissions';

type Props = {
    locations?: ModuleRow[];
};

/**
 * Read-only branch directory, reachable by branch-pinned staff. Creating a
 * branch record belongs to the Branches module, whose routes additionally
 * require head-office access — `school.locations.*` has no create action, so
 * this page offers no create affordance.
 */
export default function SchoolLocationsPage({ locations }: Props) {
    const rows =
        locations && locations.length > 0 ? locations : schoolLocations.rows;

    return (
        <ModuleFixturePage
            title={schoolLocations.title}
            subtitle={schoolLocations.subtitle}
            columns={schoolLocations.columns}
            rows={rows}
            exportPermission={PERMISSIONS.SCHOOL_LOCATIONS.EXPORT}
        />
    );
}
