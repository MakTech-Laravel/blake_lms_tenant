import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolAssessments } from '@/data/modules/school-modules';

export default function SchoolAssessmentsPage() {
    return (
        <ModuleFixturePage
            title={schoolAssessments.title}
            subtitle={schoolAssessments.subtitle}
            columns={schoolAssessments.columns}
            rows={schoolAssessments.rows}
            createLabel="Create Assessment"
        />
    );
}
