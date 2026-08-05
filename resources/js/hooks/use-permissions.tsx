import { usePage } from '@inertiajs/react';
import { PERMISSIONS } from '@/types/permissions';
import type { PermissionKey } from '@/types/permissions';

/**
 * usePermission
 *
 * Reads from auth.user.roles and auth.user.permissions.
 *
 * These are flat string arrays merged into the user object by
 * HandleInertiaRequests::share() via array_merge($user->toArray(), [...]).
 *
 * Shape expected:
 *   auth.user.roles       → string[]       e.g. ['admin']
 *   auth.user.permissions → PermissionKey[] e.g. ['posts.view', 'posts.create']
 *
 * NOT:
 *   auth.user.roles       → Role[]   (Eloquent objects — wrong)
 *   auth.user.permissions → []       (empty because model relation — wrong)
 */
export function usePermission() {
    const { auth } = usePage().props;

    const isSuperAdmin = auth?.user?.is_super_admin ?? false;
    const userPermissions: PermissionKey[] = (auth?.user?.permissions ??
        []) as PermissionKey[];
    const userRoles: string[] = auth?.user?.roles ?? [];

    /**
     * Check one permission.
     * Always use the PERMISSIONS constant — never a raw string.
     *
     *   ✅ can(PERMISSIONS.POSTS.DELETE)
     *   ❌ can('posts.delete')
     */
    const can = (permission: PermissionKey): boolean =>
        isSuperAdmin || userPermissions.includes(permission);

    /**
     * Check if user has ANY of the given permissions.
     *
     *   canAny([PERMISSIONS.POSTS.EDIT, PERMISSIONS.POSTS.DELETE])
     */
    const canAny = (permissions: PermissionKey[]): boolean =>
        isSuperAdmin || permissions.some((p) => userPermissions.includes(p));

    /**
     * Check if user has ALL of the given permissions.
     *
     *   canAll([PERMISSIONS.POSTS.CREATE, PERMISSIONS.POSTS.PUBLISH])
     */
    const canAll = (permissions: PermissionKey[]): boolean =>
        isSuperAdmin || permissions.every((p) => userPermissions.includes(p));

    /**
     * Check a role by name.
     * Roles are dynamic strings — no constant.
     * Prefer can() for features. Use hasRole() for role-specific UI only.
     *
     *   hasRole('admin')
     *   hasRole('super-admin')
     */
    const hasRole = (role: string): boolean => userRoles.includes(role);

    /**
     * Check if user has ANY of the given roles.
     *
     *   hasAnyRole(['admin', 'super-admin'])
     */
    const hasAnyRole = (roles: string[]): boolean =>
        roles.some((r) => userRoles.includes(r));

    return { can, canAny, canAll, hasRole, hasAnyRole };
}

export { PERMISSIONS };
