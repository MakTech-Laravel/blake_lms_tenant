import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import type { ModuleRow } from '@/data/modules/platform-modules';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';
import { PERMISSIONS } from '@/types/permissions';

type Props = {
    people?: ModuleRow[];
};

export default function SchoolPeoplePage({ people }: Props) {
    const { people: fixture } = useSchoolModuleVariant();
    const rows = people && people.length > 0 ? people : fixture.rows;

    return (
        <ModuleFixturePage
            title={fixture.title}
            subtitle={fixture.subtitle}
            columns={fixture.columns}
            rows={rows}
            createLabel="Add Staff"
            createPermission={PERMISSIONS.SCHOOL_STAFF.CREATE}
            exportPermission={PERMISSIONS.SCHOOL_STAFF.EXPORT}
        />
    );
}
