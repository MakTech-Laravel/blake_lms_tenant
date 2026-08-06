import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformSupport } from '@/data/modules/platform-modules';

export default function PlatformSupportPage() {
    return (
        <ModuleFixturePage
            title={platformSupport.title}
            subtitle={platformSupport.subtitle}
            columns={platformSupport.columns}
            rows={platformSupport.rows}
            createLabel="Open Tool"
        />
    );
}
