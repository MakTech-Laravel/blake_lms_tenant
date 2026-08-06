import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';

export default function SchoolAssignmentsPage() {
    const { assignments } = useSchoolModuleVariant();

    return (
        <ModuleFixturePage
            title={assignments.title}
            subtitle={assignments.subtitle}
            columns={assignments.columns}
            rows={assignments.rows}
            createLabel="Assign Training"
        />
    );
}
