<?php

namespace App\Enums;

enum PermissionEnum: string
{
    // ─── PLATFORM DOMAIN ──────────────────────────────────────────────────────

    // DASHBOARD
    case DASHBOARD_VIEW = 'dashboard.view';
    case REPOSITORY_VIEW = 'repository.view';
    case DOCUMENTATION_VIEW = 'documentation.view';

    // FILE UPLOAD
    case FILE_UPLOAD_INDEX = 'file-upload.index';
    case FILE_UPLOAD_STORE = 'file-upload.store';

    // ICON PICKER
    case ICON_PICKER_INDEX = 'icon-picker.index';
    case ICON_PICKER_STORE = 'icon-picker.store';

    // POSTS
    case POSTS_INDEX = 'posts.index';
    case POSTS_VIEW = 'posts.view';
    case POSTS_CREATE = 'posts.create';
    case POSTS_EDIT = 'posts.edit';
    case POSTS_DELETE = 'posts.delete';
    case POSTS_PUBLISH = 'posts.publish';

    // USERS (platform staff)
    case USERS_INDEX = 'users.index';
    case USERS_VIEW = 'users.view';
    case USERS_CREATE = 'users.create';
    case USERS_EDIT = 'users.edit';
    case USERS_DELETE = 'users.delete';
    case USERS_EXPORT = 'users.export';
    case USERS_IMPERSONATE = 'users.impersonate';

    // ROLES (platform)
    case ROLES_INDEX = 'roles.index';
    case ROLES_VIEW = 'roles.view';
    case ROLES_CREATE = 'roles.create';
    case ROLES_EDIT = 'roles.edit';
    case ROLES_DELETE = 'roles.delete';
    case ROLES_EXPORT = 'roles.export';

    // PERMISSIONS (developer-defined, read-only — listing & export only)
    case PERMISSIONS_INDEX = 'permissions.index';
    case PERMISSIONS_EXPORT = 'permissions.export';

    // SCHOOLS (platform-level tenant management — Organizations UI)
    case PLATFORM_SCHOOLS_INDEX = 'platform.schools.index';
    case PLATFORM_SCHOOLS_VIEW = 'platform.schools.view';
    case PLATFORM_SCHOOLS_CREATE = 'platform.schools.create';
    case PLATFORM_SCHOOLS_EDIT = 'platform.schools.edit';
    case PLATFORM_SCHOOLS_DELETE = 'platform.schools.delete';
    case PLATFORM_SCHOOLS_EXPORT = 'platform.schools.export';

    // LOCATIONS (cross-tenant directory)
    case PLATFORM_LOCATIONS_INDEX = 'platform.locations.index';
    case PLATFORM_LOCATIONS_VIEW = 'platform.locations.view';
    case PLATFORM_LOCATIONS_CREATE = 'platform.locations.create';
    case PLATFORM_LOCATIONS_EDIT = 'platform.locations.edit';
    case PLATFORM_LOCATIONS_DELETE = 'platform.locations.delete';
    case PLATFORM_LOCATIONS_EXPORT = 'platform.locations.export';

    // SUBSCRIPTIONS
    case PLATFORM_SUBSCRIPTIONS_INDEX = 'platform.subscriptions.index';
    case PLATFORM_SUBSCRIPTIONS_VIEW = 'platform.subscriptions.view';
    case PLATFORM_SUBSCRIPTIONS_CREATE = 'platform.subscriptions.create';
    case PLATFORM_SUBSCRIPTIONS_EDIT = 'platform.subscriptions.edit';
    case PLATFORM_SUBSCRIPTIONS_DELETE = 'platform.subscriptions.delete';
    case PLATFORM_SUBSCRIPTIONS_EXPORT = 'platform.subscriptions.export';

    // LEARNING (catalog)
    case PLATFORM_LEARNING_INDEX = 'platform.learning.index';
    case PLATFORM_LEARNING_VIEW = 'platform.learning.view';
    case PLATFORM_LEARNING_CREATE = 'platform.learning.create';
    case PLATFORM_LEARNING_EDIT = 'platform.learning.edit';
    case PLATFORM_LEARNING_DELETE = 'platform.learning.delete';
    case PLATFORM_LEARNING_PUBLISH = 'platform.learning.publish';
    case PLATFORM_LEARNING_EXPORT = 'platform.learning.export';

    // PATHWAYS
    case PLATFORM_PATHWAYS_INDEX = 'platform.pathways.index';
    case PLATFORM_PATHWAYS_VIEW = 'platform.pathways.view';
    case PLATFORM_PATHWAYS_CREATE = 'platform.pathways.create';
    case PLATFORM_PATHWAYS_EDIT = 'platform.pathways.edit';
    case PLATFORM_PATHWAYS_DELETE = 'platform.pathways.delete';
    case PLATFORM_PATHWAYS_ASSIGN = 'platform.pathways.assign';
    case PLATFORM_PATHWAYS_EXPORT = 'platform.pathways.export';

    // ASSESSMENTS
    case PLATFORM_ASSESSMENTS_INDEX = 'platform.assessments.index';
    case PLATFORM_ASSESSMENTS_VIEW = 'platform.assessments.view';
    case PLATFORM_ASSESSMENTS_CREATE = 'platform.assessments.create';
    case PLATFORM_ASSESSMENTS_EDIT = 'platform.assessments.edit';
    case PLATFORM_ASSESSMENTS_DELETE = 'platform.assessments.delete';
    case PLATFORM_ASSESSMENTS_PUBLISH = 'platform.assessments.publish';
    case PLATFORM_ASSESSMENTS_EXPORT = 'platform.assessments.export';

    // CERTIFICATES
    case PLATFORM_CERTIFICATES_INDEX = 'platform.certificates.index';
    case PLATFORM_CERTIFICATES_VIEW = 'platform.certificates.view';
    case PLATFORM_CERTIFICATES_ISSUE = 'platform.certificates.issue';
    case PLATFORM_CERTIFICATES_DOWNLOAD = 'platform.certificates.download';
    case PLATFORM_CERTIFICATES_REVOKE = 'platform.certificates.revoke';
    case PLATFORM_CERTIFICATES_EXPORT = 'platform.certificates.export';
    case PLATFORM_CERTIFICATES_TEMPLATES_MANAGE = 'platform.certificates.templates.manage';

    // REPORTS
    case PLATFORM_REPORTS_INDEX = 'platform.reports.index';
    case PLATFORM_REPORTS_VIEW = 'platform.reports.view';
    case PLATFORM_REPORTS_CREATE = 'platform.reports.create';
    case PLATFORM_REPORTS_RUN = 'platform.reports.run';
    case PLATFORM_REPORTS_EXPORT = 'platform.reports.export';

    // NOTIFICATIONS
    case PLATFORM_NOTIFICATIONS_INDEX = 'platform.notifications.index';
    case PLATFORM_NOTIFICATIONS_VIEW = 'platform.notifications.view';
    case PLATFORM_NOTIFICATIONS_SEND = 'platform.notifications.send';
    case PLATFORM_NOTIFICATIONS_EDIT = 'platform.notifications.edit';
    case PLATFORM_NOTIFICATIONS_DELETE = 'platform.notifications.delete';
    case PLATFORM_NOTIFICATIONS_EXPORT = 'platform.notifications.export';

    // SUPPORT TOOLS
    case PLATFORM_SUPPORT_INDEX = 'platform.support.index';
    case PLATFORM_SUPPORT_IMPERSONATE = 'platform.support.impersonate';
    case PLATFORM_SUPPORT_AUDIT_EXPORT = 'platform.support.audit.export';
    case PLATFORM_SUPPORT_PASSWORD_RESET = 'platform.support.password.reset';
    case PLATFORM_SUPPORT_FEATURE_FLAGS = 'platform.support.feature-flags.toggle';

    // SYSTEM SETTINGS (tab-level)
    case PLATFORM_SYSTEM_SECURITY_EDIT = 'platform.system.security.edit';
    case PLATFORM_SYSTEM_INTEGRATIONS_EDIT = 'platform.system.integrations.edit';
    case PLATFORM_SYSTEM_BRANDING_EDIT = 'platform.system.branding.edit';
    case PLATFORM_SYSTEM_BILLING_VIEW = 'platform.system.billing.view';

    // SETTINGS (platform)
    case SETTINGS_INDEX = 'settings.index';
    case SETTINGS_VIEW = 'settings.view';
    case SETTINGS_CREATE = 'settings.create';
    case SETTINGS_EDIT = 'settings.edit';
    case SETTINGS_DELETE = 'settings.delete';
    case SETTINGS_IMPORT = 'settings.import';
    case SETTINGS_EXPORT = 'settings.export';
    case SETTINGS_PRINT = 'settings.print';

    // ─── SCHOOL DOMAIN ────────────────────────────────────────────────────────

    // DASHBOARD
    case SCHOOL_DASHBOARD_VIEW = 'school.dashboard.view';

    // BRANCHES (school locations — managing them is a head-office action)
    case SCHOOL_BRANCHES_INDEX = 'school.branches.index';
    case SCHOOL_BRANCHES_VIEW = 'school.branches.view';
    case SCHOOL_BRANCHES_CREATE = 'school.branches.create';
    case SCHOOL_BRANCHES_EDIT = 'school.branches.edit';
    case SCHOOL_BRANCHES_DELETE = 'school.branches.delete';

    // LOCATIONS (read-only directory — branch-safe)
    case SCHOOL_LOCATIONS_INDEX = 'school.locations.index';
    case SCHOOL_LOCATIONS_VIEW = 'school.locations.view';
    case SCHOOL_LOCATIONS_EXPORT = 'school.locations.export';

    // STAFF (school users)
    case SCHOOL_STAFF_INDEX = 'school.staff.index';
    case SCHOOL_STAFF_VIEW = 'school.staff.view';
    case SCHOOL_STAFF_CREATE = 'school.staff.create';
    case SCHOOL_STAFF_EDIT = 'school.staff.edit';
    case SCHOOL_STAFF_DELETE = 'school.staff.delete';
    case SCHOOL_STAFF_EXPORT = 'school.staff.export';

    // ROLES (school)
    case SCHOOL_ROLES_INDEX = 'school.roles.index';
    case SCHOOL_ROLES_VIEW = 'school.roles.view';
    case SCHOOL_ROLES_CREATE = 'school.roles.create';
    case SCHOOL_ROLES_EDIT = 'school.roles.edit';
    case SCHOOL_ROLES_DELETE = 'school.roles.delete';
    case SCHOOL_ROLES_EXPORT = 'school.roles.export';

    // COURSES
    case SCHOOL_COURSES_INDEX = 'school.courses.index';
    case SCHOOL_COURSES_VIEW = 'school.courses.view';
    case SCHOOL_COURSES_CREATE = 'school.courses.create';
    case SCHOOL_COURSES_EDIT = 'school.courses.edit';
    case SCHOOL_COURSES_DELETE = 'school.courses.delete';
    case SCHOOL_COURSES_PUBLISH = 'school.courses.publish';
    case SCHOOL_COURSES_ASSIGN = 'school.courses.assign';
    case SCHOOL_COURSES_EXPORT = 'school.courses.export';

    // LIBRARY
    case SCHOOL_LIBRARY_INDEX = 'school.library.index';
    case SCHOOL_LIBRARY_VIEW = 'school.library.view';
    case SCHOOL_LIBRARY_UPLOAD = 'school.library.upload';
    case SCHOOL_LIBRARY_EDIT = 'school.library.edit';
    case SCHOOL_LIBRARY_DELETE = 'school.library.delete';
    case SCHOOL_LIBRARY_EXPORT = 'school.library.export';

    // PATHWAYS
    case SCHOOL_PATHWAYS_INDEX = 'school.pathways.index';
    case SCHOOL_PATHWAYS_VIEW = 'school.pathways.view';
    case SCHOOL_PATHWAYS_CREATE = 'school.pathways.create';
    case SCHOOL_PATHWAYS_EDIT = 'school.pathways.edit';
    case SCHOOL_PATHWAYS_DELETE = 'school.pathways.delete';
    case SCHOOL_PATHWAYS_ASSIGN = 'school.pathways.assign';
    case SCHOOL_PATHWAYS_EXPORT = 'school.pathways.export';

    // ASSIGNMENTS
    case SCHOOL_ASSIGNMENTS_INDEX = 'school.assignments.index';
    case SCHOOL_ASSIGNMENTS_VIEW = 'school.assignments.view';
    case SCHOOL_ASSIGNMENTS_CREATE = 'school.assignments.create';
    case SCHOOL_ASSIGNMENTS_EDIT = 'school.assignments.edit';
    case SCHOOL_ASSIGNMENTS_DELETE = 'school.assignments.delete';
    case SCHOOL_ASSIGNMENTS_EXPORT = 'school.assignments.export';

    // ASSESSMENTS
    case SCHOOL_ASSESSMENTS_INDEX = 'school.assessments.index';
    case SCHOOL_ASSESSMENTS_VIEW = 'school.assessments.view';
    case SCHOOL_ASSESSMENTS_CREATE = 'school.assessments.create';
    case SCHOOL_ASSESSMENTS_EDIT = 'school.assessments.edit';
    case SCHOOL_ASSESSMENTS_DELETE = 'school.assessments.delete';
    case SCHOOL_ASSESSMENTS_PUBLISH = 'school.assessments.publish';
    case SCHOOL_ASSESSMENTS_GRADE = 'school.assessments.grade';
    case SCHOOL_ASSESSMENTS_EXPORT = 'school.assessments.export';

    // CERTIFICATES
    case SCHOOL_CERTIFICATES_INDEX = 'school.certificates.index';
    case SCHOOL_CERTIFICATES_VIEW = 'school.certificates.view';
    case SCHOOL_CERTIFICATES_ISSUE = 'school.certificates.issue';
    case SCHOOL_CERTIFICATES_DOWNLOAD = 'school.certificates.download';
    case SCHOOL_CERTIFICATES_REVOKE = 'school.certificates.revoke';
    case SCHOOL_CERTIFICATES_EXPORT = 'school.certificates.export';

    // BILLING
    case SCHOOL_BILLING_VIEW = 'school.billing.view';
    case SCHOOL_BILLING_EXPORT = 'school.billing.export';
    case SCHOOL_BILLING_INVOICE_DOWNLOAD = 'school.billing.invoice.download';
    case SCHOOL_BILLING_MANAGE = 'school.billing.manage';

    // REPORTS
    case SCHOOL_REPORTS_INDEX = 'school.reports.index';
    case SCHOOL_REPORTS_VIEW = 'school.reports.view';
    case SCHOOL_REPORTS_CREATE = 'school.reports.create';
    case SCHOOL_REPORTS_EXPORT = 'school.reports.export';

    // NOTIFICATIONS
    case SCHOOL_NOTIFICATIONS_INDEX = 'school.notifications.index';
    case SCHOOL_NOTIFICATIONS_VIEW = 'school.notifications.view';
    case SCHOOL_NOTIFICATIONS_SEND = 'school.notifications.send';
    case SCHOOL_NOTIFICATIONS_EDIT = 'school.notifications.edit';
    case SCHOOL_NOTIFICATIONS_DELETE = 'school.notifications.delete';
    case SCHOOL_NOTIFICATIONS_EXPORT = 'school.notifications.export';

    // SETTINGS (school)
    case SCHOOL_SETTINGS_VIEW = 'school.settings.view';
    case SCHOOL_SETTINGS_EDIT = 'school.settings.edit';
    case SCHOOL_SETTINGS_BRANDING_EDIT = 'school.settings.branding.edit';
    case SCHOOL_SETTINGS_COMPLIANCE_EDIT = 'school.settings.compliance.edit';
    case SCHOOL_SETTINGS_NOTIFICATIONS_EDIT = 'school.settings.notifications.edit';

    // -------------------------------------------------------------------------
    // domain() — which dashboard this permission belongs to. A platform role may
    // only be granted PLATFORM permissions; a school role only SCHOOL ones.
    // -------------------------------------------------------------------------
    public function domain(): PermissionDomain
    {
        return match ($this) {
            self::SCHOOL_DASHBOARD_VIEW,
            self::SCHOOL_BRANCHES_INDEX,
            self::SCHOOL_BRANCHES_VIEW,
            self::SCHOOL_BRANCHES_CREATE,
            self::SCHOOL_BRANCHES_EDIT,
            self::SCHOOL_BRANCHES_DELETE,
            self::SCHOOL_LOCATIONS_INDEX,
            self::SCHOOL_LOCATIONS_VIEW,
            self::SCHOOL_LOCATIONS_EXPORT,
            self::SCHOOL_STAFF_INDEX,
            self::SCHOOL_STAFF_VIEW,
            self::SCHOOL_STAFF_CREATE,
            self::SCHOOL_STAFF_EDIT,
            self::SCHOOL_STAFF_DELETE,
            self::SCHOOL_STAFF_EXPORT,
            self::SCHOOL_ROLES_INDEX,
            self::SCHOOL_ROLES_VIEW,
            self::SCHOOL_ROLES_CREATE,
            self::SCHOOL_ROLES_EDIT,
            self::SCHOOL_ROLES_DELETE,
            self::SCHOOL_ROLES_EXPORT,
            self::SCHOOL_COURSES_INDEX,
            self::SCHOOL_COURSES_VIEW,
            self::SCHOOL_COURSES_CREATE,
            self::SCHOOL_COURSES_EDIT,
            self::SCHOOL_COURSES_DELETE,
            self::SCHOOL_COURSES_PUBLISH,
            self::SCHOOL_COURSES_ASSIGN,
            self::SCHOOL_COURSES_EXPORT,
            self::SCHOOL_LIBRARY_INDEX,
            self::SCHOOL_LIBRARY_VIEW,
            self::SCHOOL_LIBRARY_UPLOAD,
            self::SCHOOL_LIBRARY_EDIT,
            self::SCHOOL_LIBRARY_DELETE,
            self::SCHOOL_LIBRARY_EXPORT,
            self::SCHOOL_PATHWAYS_INDEX,
            self::SCHOOL_PATHWAYS_VIEW,
            self::SCHOOL_PATHWAYS_CREATE,
            self::SCHOOL_PATHWAYS_EDIT,
            self::SCHOOL_PATHWAYS_DELETE,
            self::SCHOOL_PATHWAYS_ASSIGN,
            self::SCHOOL_PATHWAYS_EXPORT,
            self::SCHOOL_ASSIGNMENTS_INDEX,
            self::SCHOOL_ASSIGNMENTS_VIEW,
            self::SCHOOL_ASSIGNMENTS_CREATE,
            self::SCHOOL_ASSIGNMENTS_EDIT,
            self::SCHOOL_ASSIGNMENTS_DELETE,
            self::SCHOOL_ASSIGNMENTS_EXPORT,
            self::SCHOOL_ASSESSMENTS_INDEX,
            self::SCHOOL_ASSESSMENTS_VIEW,
            self::SCHOOL_ASSESSMENTS_CREATE,
            self::SCHOOL_ASSESSMENTS_EDIT,
            self::SCHOOL_ASSESSMENTS_DELETE,
            self::SCHOOL_ASSESSMENTS_PUBLISH,
            self::SCHOOL_ASSESSMENTS_GRADE,
            self::SCHOOL_ASSESSMENTS_EXPORT,
            self::SCHOOL_CERTIFICATES_INDEX,
            self::SCHOOL_CERTIFICATES_VIEW,
            self::SCHOOL_CERTIFICATES_ISSUE,
            self::SCHOOL_CERTIFICATES_DOWNLOAD,
            self::SCHOOL_CERTIFICATES_REVOKE,
            self::SCHOOL_CERTIFICATES_EXPORT,
            self::SCHOOL_BILLING_VIEW,
            self::SCHOOL_BILLING_EXPORT,
            self::SCHOOL_BILLING_INVOICE_DOWNLOAD,
            self::SCHOOL_BILLING_MANAGE,
            self::SCHOOL_REPORTS_INDEX,
            self::SCHOOL_REPORTS_VIEW,
            self::SCHOOL_REPORTS_CREATE,
            self::SCHOOL_REPORTS_EXPORT,
            self::SCHOOL_NOTIFICATIONS_INDEX,
            self::SCHOOL_NOTIFICATIONS_VIEW,
            self::SCHOOL_NOTIFICATIONS_SEND,
            self::SCHOOL_NOTIFICATIONS_EDIT,
            self::SCHOOL_NOTIFICATIONS_DELETE,
            self::SCHOOL_NOTIFICATIONS_EXPORT,
            self::SCHOOL_SETTINGS_VIEW,
            self::SCHOOL_SETTINGS_EDIT,
            self::SCHOOL_SETTINGS_BRANDING_EDIT,
            self::SCHOOL_SETTINGS_COMPLIANCE_EDIT,
            self::SCHOOL_SETTINGS_NOTIFICATIONS_EDIT => PermissionDomain::SCHOOL,

            default => PermissionDomain::PLATFORM,
        };
    }

    // -------------------------------------------------------------------------
    // group() — returns the display group for the `group` DB column.
    // Used by PermissionSeeder and the role management UI (grouped checkboxes).
    // -------------------------------------------------------------------------
    public function group(): string
    {
        return match ($this) {
            self::DASHBOARD_VIEW,
            self::REPOSITORY_VIEW,
            self::DOCUMENTATION_VIEW => 'Dashboard',

            self::FILE_UPLOAD_INDEX,
            self::FILE_UPLOAD_STORE => 'File Upload',

            self::ICON_PICKER_INDEX,
            self::ICON_PICKER_STORE => 'Icon Picker',

            self::POSTS_INDEX,
            self::POSTS_VIEW,
            self::POSTS_CREATE,
            self::POSTS_EDIT,
            self::POSTS_DELETE,
            self::POSTS_PUBLISH => 'Posts',

            self::USERS_INDEX,
            self::USERS_VIEW,
            self::USERS_CREATE,
            self::USERS_EDIT,
            self::USERS_DELETE,
            self::USERS_EXPORT,
            self::USERS_IMPERSONATE => 'Users',

            self::ROLES_INDEX,
            self::ROLES_VIEW,
            self::ROLES_CREATE,
            self::ROLES_EDIT,
            self::ROLES_DELETE,
            self::ROLES_EXPORT => 'Roles',

            self::PERMISSIONS_INDEX,
            self::PERMISSIONS_EXPORT => 'Permissions',

            self::PLATFORM_SCHOOLS_INDEX,
            self::PLATFORM_SCHOOLS_VIEW,
            self::PLATFORM_SCHOOLS_CREATE,
            self::PLATFORM_SCHOOLS_EDIT,
            self::PLATFORM_SCHOOLS_DELETE,
            self::PLATFORM_SCHOOLS_EXPORT => 'Schools',

            self::PLATFORM_LOCATIONS_INDEX,
            self::PLATFORM_LOCATIONS_VIEW,
            self::PLATFORM_LOCATIONS_CREATE,
            self::PLATFORM_LOCATIONS_EDIT,
            self::PLATFORM_LOCATIONS_DELETE,
            self::PLATFORM_LOCATIONS_EXPORT => 'Locations',

            self::PLATFORM_SUBSCRIPTIONS_INDEX,
            self::PLATFORM_SUBSCRIPTIONS_VIEW,
            self::PLATFORM_SUBSCRIPTIONS_CREATE,
            self::PLATFORM_SUBSCRIPTIONS_EDIT,
            self::PLATFORM_SUBSCRIPTIONS_DELETE,
            self::PLATFORM_SUBSCRIPTIONS_EXPORT => 'Subscriptions',

            self::PLATFORM_LEARNING_INDEX,
            self::PLATFORM_LEARNING_VIEW,
            self::PLATFORM_LEARNING_CREATE,
            self::PLATFORM_LEARNING_EDIT,
            self::PLATFORM_LEARNING_DELETE,
            self::PLATFORM_LEARNING_PUBLISH,
            self::PLATFORM_LEARNING_EXPORT => 'Learning',

            self::PLATFORM_PATHWAYS_INDEX,
            self::PLATFORM_PATHWAYS_VIEW,
            self::PLATFORM_PATHWAYS_CREATE,
            self::PLATFORM_PATHWAYS_EDIT,
            self::PLATFORM_PATHWAYS_DELETE,
            self::PLATFORM_PATHWAYS_ASSIGN,
            self::PLATFORM_PATHWAYS_EXPORT => 'Pathways',

            self::PLATFORM_ASSESSMENTS_INDEX,
            self::PLATFORM_ASSESSMENTS_VIEW,
            self::PLATFORM_ASSESSMENTS_CREATE,
            self::PLATFORM_ASSESSMENTS_EDIT,
            self::PLATFORM_ASSESSMENTS_DELETE,
            self::PLATFORM_ASSESSMENTS_PUBLISH,
            self::PLATFORM_ASSESSMENTS_EXPORT => 'Assessments',

            self::PLATFORM_CERTIFICATES_INDEX,
            self::PLATFORM_CERTIFICATES_VIEW,
            self::PLATFORM_CERTIFICATES_ISSUE,
            self::PLATFORM_CERTIFICATES_DOWNLOAD,
            self::PLATFORM_CERTIFICATES_REVOKE,
            self::PLATFORM_CERTIFICATES_EXPORT,
            self::PLATFORM_CERTIFICATES_TEMPLATES_MANAGE => 'Certificates',

            self::PLATFORM_REPORTS_INDEX,
            self::PLATFORM_REPORTS_VIEW,
            self::PLATFORM_REPORTS_CREATE,
            self::PLATFORM_REPORTS_RUN,
            self::PLATFORM_REPORTS_EXPORT => 'Reports',

            self::PLATFORM_NOTIFICATIONS_INDEX,
            self::PLATFORM_NOTIFICATIONS_VIEW,
            self::PLATFORM_NOTIFICATIONS_SEND,
            self::PLATFORM_NOTIFICATIONS_EDIT,
            self::PLATFORM_NOTIFICATIONS_DELETE,
            self::PLATFORM_NOTIFICATIONS_EXPORT => 'Notifications',

            self::PLATFORM_SUPPORT_INDEX,
            self::PLATFORM_SUPPORT_IMPERSONATE,
            self::PLATFORM_SUPPORT_AUDIT_EXPORT,
            self::PLATFORM_SUPPORT_PASSWORD_RESET,
            self::PLATFORM_SUPPORT_FEATURE_FLAGS => 'Support Tools',

            self::PLATFORM_SYSTEM_SECURITY_EDIT,
            self::PLATFORM_SYSTEM_INTEGRATIONS_EDIT,
            self::PLATFORM_SYSTEM_BRANDING_EDIT,
            self::PLATFORM_SYSTEM_BILLING_VIEW => 'System',

            self::SETTINGS_INDEX,
            self::SETTINGS_VIEW,
            self::SETTINGS_CREATE,
            self::SETTINGS_EDIT,
            self::SETTINGS_DELETE,
            self::SETTINGS_IMPORT,
            self::SETTINGS_EXPORT,
            self::SETTINGS_PRINT => 'Settings',

            self::SCHOOL_DASHBOARD_VIEW => 'Dashboard',

            self::SCHOOL_BRANCHES_INDEX,
            self::SCHOOL_BRANCHES_VIEW,
            self::SCHOOL_BRANCHES_CREATE,
            self::SCHOOL_BRANCHES_EDIT,
            self::SCHOOL_BRANCHES_DELETE => 'Branches',

            self::SCHOOL_LOCATIONS_INDEX,
            self::SCHOOL_LOCATIONS_VIEW,
            self::SCHOOL_LOCATIONS_EXPORT => 'Locations',

            self::SCHOOL_STAFF_INDEX,
            self::SCHOOL_STAFF_VIEW,
            self::SCHOOL_STAFF_CREATE,
            self::SCHOOL_STAFF_EDIT,
            self::SCHOOL_STAFF_DELETE,
            self::SCHOOL_STAFF_EXPORT => 'Staff',

            self::SCHOOL_ROLES_INDEX,
            self::SCHOOL_ROLES_VIEW,
            self::SCHOOL_ROLES_CREATE,
            self::SCHOOL_ROLES_EDIT,
            self::SCHOOL_ROLES_DELETE,
            self::SCHOOL_ROLES_EXPORT => 'Roles',

            self::SCHOOL_COURSES_INDEX,
            self::SCHOOL_COURSES_VIEW,
            self::SCHOOL_COURSES_CREATE,
            self::SCHOOL_COURSES_EDIT,
            self::SCHOOL_COURSES_DELETE,
            self::SCHOOL_COURSES_PUBLISH,
            self::SCHOOL_COURSES_ASSIGN,
            self::SCHOOL_COURSES_EXPORT => 'Courses',

            self::SCHOOL_LIBRARY_INDEX,
            self::SCHOOL_LIBRARY_VIEW,
            self::SCHOOL_LIBRARY_UPLOAD,
            self::SCHOOL_LIBRARY_EDIT,
            self::SCHOOL_LIBRARY_DELETE,
            self::SCHOOL_LIBRARY_EXPORT => 'Library',

            self::SCHOOL_PATHWAYS_INDEX,
            self::SCHOOL_PATHWAYS_VIEW,
            self::SCHOOL_PATHWAYS_CREATE,
            self::SCHOOL_PATHWAYS_EDIT,
            self::SCHOOL_PATHWAYS_DELETE,
            self::SCHOOL_PATHWAYS_ASSIGN,
            self::SCHOOL_PATHWAYS_EXPORT => 'Pathways',

            self::SCHOOL_ASSIGNMENTS_INDEX,
            self::SCHOOL_ASSIGNMENTS_VIEW,
            self::SCHOOL_ASSIGNMENTS_CREATE,
            self::SCHOOL_ASSIGNMENTS_EDIT,
            self::SCHOOL_ASSIGNMENTS_DELETE,
            self::SCHOOL_ASSIGNMENTS_EXPORT => 'Assignments',

            self::SCHOOL_ASSESSMENTS_INDEX,
            self::SCHOOL_ASSESSMENTS_VIEW,
            self::SCHOOL_ASSESSMENTS_CREATE,
            self::SCHOOL_ASSESSMENTS_EDIT,
            self::SCHOOL_ASSESSMENTS_DELETE,
            self::SCHOOL_ASSESSMENTS_PUBLISH,
            self::SCHOOL_ASSESSMENTS_GRADE,
            self::SCHOOL_ASSESSMENTS_EXPORT => 'Assessments',

            self::SCHOOL_CERTIFICATES_INDEX,
            self::SCHOOL_CERTIFICATES_VIEW,
            self::SCHOOL_CERTIFICATES_ISSUE,
            self::SCHOOL_CERTIFICATES_DOWNLOAD,
            self::SCHOOL_CERTIFICATES_REVOKE,
            self::SCHOOL_CERTIFICATES_EXPORT => 'Certificates',

            self::SCHOOL_BILLING_VIEW,
            self::SCHOOL_BILLING_EXPORT,
            self::SCHOOL_BILLING_INVOICE_DOWNLOAD,
            self::SCHOOL_BILLING_MANAGE => 'Billing',

            self::SCHOOL_REPORTS_INDEX,
            self::SCHOOL_REPORTS_VIEW,
            self::SCHOOL_REPORTS_CREATE,
            self::SCHOOL_REPORTS_EXPORT => 'Reports',

            self::SCHOOL_NOTIFICATIONS_INDEX,
            self::SCHOOL_NOTIFICATIONS_VIEW,
            self::SCHOOL_NOTIFICATIONS_SEND,
            self::SCHOOL_NOTIFICATIONS_EDIT,
            self::SCHOOL_NOTIFICATIONS_DELETE,
            self::SCHOOL_NOTIFICATIONS_EXPORT => 'Notifications',

            self::SCHOOL_SETTINGS_VIEW,
            self::SCHOOL_SETTINGS_EDIT,
            self::SCHOOL_SETTINGS_BRANDING_EDIT,
            self::SCHOOL_SETTINGS_COMPLIANCE_EDIT,
            self::SCHOOL_SETTINGS_NOTIFICATIONS_EDIT => 'Settings',
        };
    }

    /**
     * All permission cases for the given domain.
     *
     * @return array<int, self>
     */
    public static function forDomain(PermissionDomain $domain): array
    {
        return array_values(array_filter(
            self::cases(),
            fn (self $permission): bool => $permission->domain() === $domain,
        ));
    }

    // -------------------------------------------------------------------------
    // guard() — returns the guard name for this permission.
    // Change to 'api' for Passport API-only apps.
    // -------------------------------------------------------------------------
    public function guard(): string
    {
        return GuardEnum::WEB->value; // change to 'api' for Passport
    }
}
