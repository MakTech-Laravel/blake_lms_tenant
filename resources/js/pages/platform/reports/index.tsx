import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformReports } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformReportsPage() {
    return (
        <ModuleFixturePage
            title={platformReports.title}
            subtitle={platformReports.subtitle}
            columns={platformReports.columns}
            rows={platformReports.rows}
            createLabel="Generate Report"
            createPermission={PERMISSIONS.PLATFORM_REPORTS.CREATE}
            exportPermission={PERMISSIONS.PLATFORM_REPORTS.EXPORT}
        />
    );
}
