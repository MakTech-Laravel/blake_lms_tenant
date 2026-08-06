import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolPathways } from '@/data/modules/school-modules';

export default function SchoolPathwaysPage() {
    return (
        <ModuleFixturePage
            title={schoolPathways.title}
            subtitle={schoolPathways.subtitle}
            columns={schoolPathways.columns}
            rows={schoolPathways.rows}
            createLabel="Create Pathway"
        />
    );
}
