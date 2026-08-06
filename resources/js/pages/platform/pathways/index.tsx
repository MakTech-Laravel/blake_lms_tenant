import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformPathways } from '@/data/modules/platform-modules';

export default function PlatformPathwaysPage() {
    return (
        <ModuleFixturePage
            title={platformPathways.title}
            subtitle={platformPathways.subtitle}
            columns={platformPathways.columns}
            rows={platformPathways.rows}
            createLabel="Create Pathway"
        />
    );
}
