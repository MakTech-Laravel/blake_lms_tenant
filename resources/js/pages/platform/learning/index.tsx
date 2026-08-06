import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformLearning } from '@/data/modules/platform-modules';

export default function PlatformLearningPage() {
    return (
        <ModuleFixturePage
            title={platformLearning.title}
            subtitle={platformLearning.subtitle}
            columns={platformLearning.columns}
            rows={platformLearning.rows}
            createLabel="Create Course"
        />
    );
}
