export type PeopleTypeFilter = 'all' | 'teacher' | 'school' | 'platform';

export type PeopleAudience = 'teacher' | 'school' | 'platform';

export type PeopleDirectoryFilters = {
    search: string;
    type: PeopleTypeFilter;
    status: string;
    organization: string;
    role: string;
    last_login: string;
};

export type DirectoryFilterRoleOption = {
    value: string;
    label: string;
};

export type DirectoryPerson = {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    initials: string;
    organization: string;
    location: string;
    role: string;
    status: string;
    user_type: string;
    user_type_label: string;
    last_login_at: string | null;
    last_login_label: string;
    edit_url: string | null;
    can_delete: boolean;
};

export type DirectoryStats = {
    total: number;
    active: number;
    pending: number;
    disabled: number;
};

export type DirectorySchoolOption = {
    id: number;
    name: string;
};

export type DirectoryRoleOption = {
    id: number;
    name: string;
};

export type DirectorySchoolRoleOption = {
    id: number;
    name: string;
    school_id: number;
};

export const PEOPLE_TYPE_TABS: { value: PeopleTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'school', label: 'Organization users' },
    { value: 'platform', label: 'Platform users' },
];

export function audienceFromTypeFilter(type: PeopleTypeFilter): PeopleAudience {
    if (type === 'school' || type === 'platform') {
        return type;
    }

    return 'teacher';
}

export function storeUrlForAudience(audience: PeopleAudience): string {
    if (audience === 'platform') {
        return '/platform/people/platform';
    }

    if (audience === 'school') {
        return '/platform/people/organization';
    }

    return '/platform/people';
}
