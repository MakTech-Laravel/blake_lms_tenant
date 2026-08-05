// =============================================================================
// ADMIN — shared shapes for the access-management pages
// (admin/users, admin/roles, admin/permissions).
// =============================================================================

/** The protected, system-critical role. Mirrors App\Enums\RoleEnum::SUPER_ADMIN. */
export const SUPER_ADMIN_ROLE = 'super-admin';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface RoleRef {
    id: number;
    name: string;
}

/** A branch a staff member or course can be pinned to. */
export interface BranchOption {
    id: number;
    name: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    created_at: string;
    roles: RoleRef[];
    /** NULL means head-office (school-wide) access. School accounts only. */
    branch_id?: number | null;
    branch?: BranchOption | null;
}

export interface AdminUserDetail extends AdminUser {
    permissions: { id: number; name: string }[];
    updated_at: string;
}

export interface AdminRoleListItem {
    id: number;
    name: string;
    guard_name: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
}

export interface AdminRoleDetail {
    id: number;
    name: string;
    permissions: string[];
    is_super_admin: boolean;
}

/** A single assignable permission, as sent to the role editor. */
export interface PermissionOption {
    id: number;
    name: string;
    group: string;
}

/** A permission row for the read-only permissions listing. */
export interface PermissionListItem {
    id: number;
    name: string;
    group: string;
    guard_name: string;
    roles_count: number;
}

/** Build the public URL for a stored avatar path, or null. */
export function avatarUrl(path: string | null): string | null {
    if (!path) {
        return null;
    }

    return path.startsWith('http') ? path : `/storage/${path}`;
}

/** Group an ordered permission list by its `group` field, preserving order. */
export function groupByGroup<T extends { group: string }>(
    items: T[],
): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
        (acc[item.group] ??= []).push(item);

        return acc;
    }, {});
}
