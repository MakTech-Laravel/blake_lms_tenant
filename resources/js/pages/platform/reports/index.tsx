import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformReports } from '@/data/modules/platform-modules';

export default function PlatformReportsPage() {
    return (
        <ModuleFixturePage
            title={platformReports.title}
            subtitle={platformReports.subtitle}
            columns={platformReports.columns}
            rows={platformReports.rows}
            createLabel="Generate Report"
        />
    );
}
