import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';
import { PERMISSIONS } from '@/types/permissions';

export default function SchoolAssignmentsPage() {
    const { assignments } = useSchoolModuleVariant();

    return (
        <ModuleFixturePage
            title={assignments.title}
            subtitle={assignments.subtitle}
            columns={assignments.columns}
            rows={assignments.rows}
            createLabel="Assign Training"
            createPermission={PERMISSIONS.SCHOOL_ASSIGNMENTS.CREATE}
            exportPermission={PERMISSIONS.SCHOOL_ASSIGNMENTS.EXPORT}
        />
    );
}
