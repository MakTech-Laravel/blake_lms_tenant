import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformPeople } from '@/data/modules/platform-modules';
import type { ModuleRow } from '@/data/modules/platform-modules';
import { PERMISSIONS } from '@/types/permissions';

type Props = {
    people?: ModuleRow[];
};

export default function PlatformPeoplePage({ people }: Props) {
    const rows = people && people.length > 0 ? people : platformPeople.rows;

    return (
        <ModuleFixturePage
            title={platformPeople.title}
            subtitle={platformPeople.subtitle}
            columns={platformPeople.columns}
            rows={rows}
            createLabel="Invite Person"
            createPermission={PERMISSIONS.USERS.CREATE}
            exportPermission={PERMISSIONS.USERS.EXPORT}
        />
    );
}
