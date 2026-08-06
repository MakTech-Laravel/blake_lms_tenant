import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolReports } from '@/data/modules/school-modules';

export default function SchoolReportsPage() {
    return (
        <ModuleFixturePage
            title={schoolReports.title}
            subtitle={schoolReports.subtitle}
            columns={schoolReports.columns}
            rows={schoolReports.rows}
            createLabel="Generate Report"
        />
    );
}
