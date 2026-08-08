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

/** Account and security facts shown on the person profile page. */
export type PersonAccount = {
    user_id: number;
    email: string;
    email_verified: boolean;
    email_verified_label: string;
    joined_label: string;
    last_login_label: string;
    last_login_exact: string;
    two_factor_enabled: boolean;
    user_type_label: string;
    updated_label: string;
};

export type PersonOrganization = {
    name: string;
    slug: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_platform: boolean;
    branch_name: string | null;
    branch_email: string | null;
    branch_phone: string | null;
    branch_address: string | null;
    is_head_office: boolean;
};

export type PersonPermissionGroup = {
    group: string;
    permissions: string[];
};

export type PersonAccess = {
    roles: string[];
    permission_groups: PersonPermissionGroup[];
    permission_count: number;
    has_all_permissions: boolean;
    is_teacher: boolean;
};

export type PersonEnrollment = {
    id: number;
    course: string;
    status: string;
    progress: number;
    enrolled_label: string;
    completed_label: string;
};

export type PersonCertificate = {
    id: number;
    number: string;
    course: string;
    status: string;
    issued_label: string;
    expires_label: string;
};

export type PersonLearning = {
    applicable: boolean;
    stats: {
        enrolled: number;
        in_progress: number;
        completed: number;
        certificates: number;
    };
    enrollments: PersonEnrollment[];
    certificates: PersonCertificate[];
};

export type PersonSession = {
    id: string;
    ip_address: string;
    device: string;
    last_active_label: string;
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
