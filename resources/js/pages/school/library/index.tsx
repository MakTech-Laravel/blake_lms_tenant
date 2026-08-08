import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { schoolLibrary } from '@/data/modules/school-modules';
import { PERMISSIONS } from '@/types/permissions';

export default function SchoolLibraryPage() {
    return (
        <ModuleFixturePage
            title={schoolLibrary.title}
            subtitle={schoolLibrary.subtitle}
            columns={schoolLibrary.columns}
            rows={schoolLibrary.rows}
            createLabel="Upload Asset"
            createPermission={PERMISSIONS.SCHOOL_LIBRARY.UPLOAD}
            exportPermission={PERMISSIONS.SCHOOL_LIBRARY.EXPORT}
        />
    );
}
