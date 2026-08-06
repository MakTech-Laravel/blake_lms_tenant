import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolLibrary } from '@/data/modules/school-modules';

export default function SchoolLibraryPage() {
    return (
        <ModuleFixturePage
            title={schoolLibrary.title}
            subtitle={schoolLibrary.subtitle}
            columns={schoolLibrary.columns}
            rows={schoolLibrary.rows}
            createLabel="Upload Asset"
        />
    );
}
