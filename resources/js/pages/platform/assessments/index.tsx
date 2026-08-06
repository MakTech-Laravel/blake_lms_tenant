import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformAssessments } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformAssessmentsPage() {
    return (
        <ModuleFixturePage
            title={platformAssessments.title}
            subtitle={platformAssessments.subtitle}
            columns={platformAssessments.columns}
            rows={platformAssessments.rows}
            createLabel="Create Assessment"
            createPermission={PERMISSIONS.PLATFORM_ASSESSMENTS.CREATE}
        />
    );
}
