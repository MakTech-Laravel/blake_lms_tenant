import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformAssessments } from '@/data/modules/platform-modules';

export default function PlatformAssessmentsPage() {
    return (
        <ModuleFixturePage
            title={platformAssessments.title}
            subtitle={platformAssessments.subtitle}
            columns={platformAssessments.columns}
            rows={platformAssessments.rows}
            createLabel="Create Assessment"
        />
    );
}
