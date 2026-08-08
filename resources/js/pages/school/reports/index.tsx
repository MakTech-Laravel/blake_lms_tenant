import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolReports } from '@/data/modules/school-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function SchoolReportsPage() {
    return (
        <ModuleFixturePage
            title={schoolReports.title}
            subtitle={schoolReports.subtitle}
            columns={schoolReports.columns}
            rows={schoolReports.rows}
            createLabel="Generate Report"
            createPermission={PERMISSIONS.SCHOOL_REPORTS.CREATE}
            exportPermission={PERMISSIONS.SCHOOL_REPORTS.EXPORT}
        />
    );
}
