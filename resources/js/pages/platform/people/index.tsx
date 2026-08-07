import { PeopleDirectoryPage } from '@/components/aquacert/people/people-directory-page';
import type {
    DirectoryPerson,
    DirectoryRoleOption,
    DirectorySchoolOption,
    DirectoryStats,
    PeopleTypeFilter,
} from '@/components/aquacert/people/types';
import type { Paginated } from '@/types/admin';

type Props = {
    people: Paginated<DirectoryPerson>;
    stats: DirectoryStats;
    filters: { search: string; type: PeopleTypeFilter };
    schools: DirectorySchoolOption[];
    roles: DirectoryRoleOption[];
};

export default function PlatformPeoplePage({
    people,
    stats,
    filters,
    schools,
    roles,
}: Props) {
    return (
        <PeopleDirectoryPage
            title="People"
            people={people}
            stats={stats}
            filters={filters}
            schools={schools}
            roles={roles}
            indexUrl="/platform/people"
            statusUrl={(id) => `/platform/directory-users/${id}/status`}
            destroyUrl={(id) => `/platform/directory-users/${id}`}
        />
    );
}
