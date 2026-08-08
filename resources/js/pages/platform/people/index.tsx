import { PeopleDirectoryPage } from '@/components/aquacert/people/people-directory-page';
import type {
    DirectoryFilterRoleOption,
    DirectoryPerson,
    DirectoryRoleOption,
    DirectorySchoolOption,
    DirectorySchoolRoleOption,
    DirectoryStats,
    PeopleDirectoryFilters,
} from '@/components/aquacert/people/types';
import type { Paginated } from '@/types/admin';

type Props = {
    people: Paginated<DirectoryPerson>;
    stats: DirectoryStats;
    filters: PeopleDirectoryFilters;
    schools: DirectorySchoolOption[];
    roles: DirectoryRoleOption[];
    schoolRoles: DirectorySchoolRoleOption[];
    filterRoles: DirectoryFilterRoleOption[];
    canAssignPlatformSuperAdmin: boolean;
};

export default function PlatformPeoplePage({
    people,
    stats,
    filters,
    schools,
    roles,
    schoolRoles,
    filterRoles,
    canAssignPlatformSuperAdmin,
}: Props) {
    return (
        <PeopleDirectoryPage
            title="People"
            people={people}
            stats={stats}
            filters={filters}
            schools={schools}
            roles={roles}
            schoolRoles={schoolRoles}
            filterRoles={filterRoles}
            canAssignPlatformSuperAdmin={canAssignPlatformSuperAdmin}
            indexUrl="/platform/people"
            statusUrl={(id) => `/platform/directory-users/${id}/status`}
            destroyUrl={(id) => `/platform/directory-users/${id}`}
        />
    );
}
