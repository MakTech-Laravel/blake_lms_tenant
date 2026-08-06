// =============================================================================
// PERMISSIONS — Fixed, developer-defined, seeded from PermissionEnum.
// Never created, edited, or deleted from the UI.
// To add a new permission: add it to app/Enums/PermissionEnum.php + here,
// then re-run: php artisan db:seed --class=PermissionSeeder
// =============================================================================

export const PERMISSIONS = {
    DASHBOARD: {
        VIEW: 'dashboard.view',
    },
    REPOSITORY: {
        VIEW: 'repository.view',
    },
    DOCUMENTATION: {
        VIEW: 'documentation.view',
    },
    FILE_UPLOAD: {
        INDEX: 'file-upload.index',
        STORE: 'file-upload.store',
    },
    POSTS: {
        INDEX: 'posts.index',
        VIEW: 'posts.view',
        CREATE: 'posts.create',
        EDIT: 'posts.edit',
        DELETE: 'posts.delete',
        PUBLISH: 'posts.publish',
    },
    USERS: {
        INDEX: 'users.index',
        VIEW: 'users.view',
        CREATE: 'users.create',
        EDIT: 'users.edit',
        DELETE: 'users.delete',
        IMPERSONATE: 'users.impersonate',
    },
    ROLES: {
        INDEX: 'roles.index',
        VIEW: 'roles.view',
        CREATE: 'roles.create',
        EDIT: 'roles.edit',
        DELETE: 'roles.delete',
    },
    PERMISSIONS: {
        INDEX: 'permissions.index',
        EXPORT: 'permissions.export',
    },
    SETTINGS: {
        INDEX: 'settings.index',
        VIEW: 'settings.view',
        CREATE: 'settings.create',
        EDIT: 'settings.edit',
        DELETE: 'settings.delete',
        IMPORT: 'settings.import',
        EXPORT: 'settings.export',
        PRINT: 'settings.print',
    },

    // ── Platform domain — tenant (school) management ─────────────────────────
    SCHOOLS: {
        INDEX: 'platform.schools.index',
        VIEW: 'platform.schools.view',
        CREATE: 'platform.schools.create',
        EDIT: 'platform.schools.edit',
        DELETE: 'platform.schools.delete',
    },
    PLATFORM_LOCATIONS: {
        INDEX: 'platform.locations.index',
        VIEW: 'platform.locations.view',
        CREATE: 'platform.locations.create',
        EDIT: 'platform.locations.edit',
        DELETE: 'platform.locations.delete',
    },
    PLATFORM_SUBSCRIPTIONS: {
        INDEX: 'platform.subscriptions.index',
        VIEW: 'platform.subscriptions.view',
        CREATE: 'platform.subscriptions.create',
        EDIT: 'platform.subscriptions.edit',
        DELETE: 'platform.subscriptions.delete',
        EXPORT: 'platform.subscriptions.export',
    },
    PLATFORM_LEARNING: {
        INDEX: 'platform.learning.index',
        VIEW: 'platform.learning.view',
        CREATE: 'platform.learning.create',
        EDIT: 'platform.learning.edit',
        DELETE: 'platform.learning.delete',
        PUBLISH: 'platform.learning.publish',
    },
    PLATFORM_PATHWAYS: {
        INDEX: 'platform.pathways.index',
        VIEW: 'platform.pathways.view',
        CREATE: 'platform.pathways.create',
        EDIT: 'platform.pathways.edit',
        DELETE: 'platform.pathways.delete',
        ASSIGN: 'platform.pathways.assign',
    },
    PLATFORM_ASSESSMENTS: {
        INDEX: 'platform.assessments.index',
        VIEW: 'platform.assessments.view',
        CREATE: 'platform.assessments.create',
        EDIT: 'platform.assessments.edit',
        DELETE: 'platform.assessments.delete',
        PUBLISH: 'platform.assessments.publish',
    },
    PLATFORM_CERTIFICATES: {
        INDEX: 'platform.certificates.index',
        VIEW: 'platform.certificates.view',
        ISSUE: 'platform.certificates.issue',
        DOWNLOAD: 'platform.certificates.download',
        REVOKE: 'platform.certificates.revoke',
        TEMPLATES_MANAGE: 'platform.certificates.templates.manage',
    },
    PLATFORM_REPORTS: {
        INDEX: 'platform.reports.index',
        VIEW: 'platform.reports.view',
        CREATE: 'platform.reports.create',
        RUN: 'platform.reports.run',
        EXPORT: 'platform.reports.export',
    },
    PLATFORM_NOTIFICATIONS: {
        INDEX: 'platform.notifications.index',
        VIEW: 'platform.notifications.view',
        SEND: 'platform.notifications.send',
        EDIT: 'platform.notifications.edit',
        DELETE: 'platform.notifications.delete',
    },
    PLATFORM_SUPPORT: {
        INDEX: 'platform.support.index',
        IMPERSONATE: 'platform.support.impersonate',
        AUDIT_EXPORT: 'platform.support.audit.export',
        PASSWORD_RESET: 'platform.support.password.reset',
        FEATURE_FLAGS: 'platform.support.feature-flags.toggle',
    },
    PLATFORM_SYSTEM: {
        SECURITY_EDIT: 'platform.system.security.edit',
        INTEGRATIONS_EDIT: 'platform.system.integrations.edit',
        BILLING_VIEW: 'platform.system.billing.view',
    },

    // ── School domain — isolated from the platform permission set ────────────
    SCHOOL_DASHBOARD: {
        VIEW: 'school.dashboard.view',
    },
    SCHOOL_BRANCHES: {
        INDEX: 'school.branches.index',
        VIEW: 'school.branches.view',
        CREATE: 'school.branches.create',
        EDIT: 'school.branches.edit',
        DELETE: 'school.branches.delete',
    },
    SCHOOL_LOCATIONS: {
        INDEX: 'school.locations.index',
        VIEW: 'school.locations.view',
    },
    SCHOOL_STAFF: {
        INDEX: 'school.staff.index',
        VIEW: 'school.staff.view',
        CREATE: 'school.staff.create',
        EDIT: 'school.staff.edit',
        DELETE: 'school.staff.delete',
    },
    SCHOOL_ROLES: {
        INDEX: 'school.roles.index',
        VIEW: 'school.roles.view',
        CREATE: 'school.roles.create',
        EDIT: 'school.roles.edit',
        DELETE: 'school.roles.delete',
    },
    SCHOOL_COURSES: {
        INDEX: 'school.courses.index',
        VIEW: 'school.courses.view',
        CREATE: 'school.courses.create',
        EDIT: 'school.courses.edit',
        DELETE: 'school.courses.delete',
        PUBLISH: 'school.courses.publish',
        ASSIGN: 'school.courses.assign',
    },
    SCHOOL_LIBRARY: {
        INDEX: 'school.library.index',
        VIEW: 'school.library.view',
        UPLOAD: 'school.library.upload',
        EDIT: 'school.library.edit',
        DELETE: 'school.library.delete',
    },
    SCHOOL_PATHWAYS: {
        INDEX: 'school.pathways.index',
        VIEW: 'school.pathways.view',
        CREATE: 'school.pathways.create',
        EDIT: 'school.pathways.edit',
        DELETE: 'school.pathways.delete',
        ASSIGN: 'school.pathways.assign',
    },
    SCHOOL_ASSIGNMENTS: {
        INDEX: 'school.assignments.index',
        VIEW: 'school.assignments.view',
        CREATE: 'school.assignments.create',
        EDIT: 'school.assignments.edit',
        DELETE: 'school.assignments.delete',
    },
    SCHOOL_ASSESSMENTS: {
        INDEX: 'school.assessments.index',
        VIEW: 'school.assessments.view',
        CREATE: 'school.assessments.create',
        EDIT: 'school.assessments.edit',
        DELETE: 'school.assessments.delete',
        PUBLISH: 'school.assessments.publish',
        GRADE: 'school.assessments.grade',
    },
    SCHOOL_CERTIFICATES: {
        INDEX: 'school.certificates.index',
        VIEW: 'school.certificates.view',
        ISSUE: 'school.certificates.issue',
        DOWNLOAD: 'school.certificates.download',
        REVOKE: 'school.certificates.revoke',
    },
    SCHOOL_BILLING: {
        VIEW: 'school.billing.view',
        EXPORT: 'school.billing.export',
        INVOICE_DOWNLOAD: 'school.billing.invoice.download',
        MANAGE: 'school.billing.manage',
    },
    SCHOOL_REPORTS: {
        INDEX: 'school.reports.index',
        VIEW: 'school.reports.view',
        CREATE: 'school.reports.create',
        EXPORT: 'school.reports.export',
    },
    SCHOOL_NOTIFICATIONS: {
        INDEX: 'school.notifications.index',
        VIEW: 'school.notifications.view',
        SEND: 'school.notifications.send',
        EDIT: 'school.notifications.edit',
        DELETE: 'school.notifications.delete',
    },
    SCHOOL_SETTINGS: {
        VIEW: 'school.settings.view',
        EDIT: 'school.settings.edit',
        BRANDING_EDIT: 'school.settings.branding.edit',
        COMPLIANCE_EDIT: 'school.settings.compliance.edit',
        NOTIFICATIONS_EDIT: 'school.settings.notifications.edit',
    },
} as const;

// Auto-derived union type from the const above.
// Adding a new entry to PERMISSIONS automatically updates this type.
type PermissionGroup = typeof PERMISSIONS;
export type PermissionKey = {
    [G in keyof PermissionGroup]: PermissionGroup[G][keyof PermissionGroup[G]];
}[keyof PermissionGroup];
// Result: 'posts.view' | 'posts.create' | 'posts.edit' | ...

// =============================================================================
// PERMISSION OBJECT — full shape returned by the backend API.
//
// `group` is ONLY used when fetching the full permission list for the
// role management UI (e.g. GET /admin/permissions).
// It is NOT included in auth.permissions — that is a flat PermissionKey[].
// =============================================================================

// Use this when you need grouping in the role management UI
export interface Permission {
    id: number;
    name: PermissionKey;
    group: string; // e.g. 'Posts', 'Users', 'Roles'
    guard_name: string;
}

// Use this when you don't care about grouping (e.g. a flat list of checkboxes)
export interface PermissionFlat {
    id: number;
    name: PermissionKey;
    guard_name: string;
}

// Helper type: permissions grouped by their group key.
// Returned by groupByGroup() in types/admin.ts.
export type PermissionsByGroup = Record<string, Permission[]>;

// =============================================================================
// ROLES — Dynamic, admin-managed at runtime via the UI.
// Admins can create, rename, delete roles and assign permissions to them.
// Always plain strings — never a hardcoded union type.
// =============================================================================

export interface Role {
    id: number;
    name: string; // dynamic — never hardcode as a union
    guard_name: string;
    permissions: Permission[]; // full permission objects with group info
}

// Payload sent to POST /admin/roles
export interface CreateRolePayload {
    name: string;
    permissions: PermissionKey[];
}

// Payload sent to PUT /admin/roles/{id}
export interface UpdateRolePayload {
    name?: string;
    permissions: PermissionKey[];
}
