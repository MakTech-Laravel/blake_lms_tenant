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

    // ROLES (platform)
    case ROLES_INDEX = 'roles.index';
    case ROLES_VIEW = 'roles.view';
    case ROLES_CREATE = 'roles.create';
    case ROLES_EDIT = 'roles.edit';
    case ROLES_DELETE = 'roles.delete';

    // PERMISSIONS (developer-defined, read-only — listing & export only)
    case PERMISSIONS_INDEX = 'permissions.index';
    case PERMISSIONS_EXPORT = 'permissions.export';

    // SCHOOLS (platform-level tenant management)
    case PLATFORM_SCHOOLS_INDEX = 'platform.schools.index';
    case PLATFORM_SCHOOLS_VIEW = 'platform.schools.view';
    case PLATFORM_SCHOOLS_CREATE = 'platform.schools.create';
    case PLATFORM_SCHOOLS_EDIT = 'platform.schools.edit';
    case PLATFORM_SCHOOLS_DELETE = 'platform.schools.delete';

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

    // STAFF (school users)
    case SCHOOL_STAFF_INDEX = 'school.staff.index';
    case SCHOOL_STAFF_VIEW = 'school.staff.view';
    case SCHOOL_STAFF_CREATE = 'school.staff.create';
    case SCHOOL_STAFF_EDIT = 'school.staff.edit';
    case SCHOOL_STAFF_DELETE = 'school.staff.delete';

    // ROLES (school)
    case SCHOOL_ROLES_INDEX = 'school.roles.index';
    case SCHOOL_ROLES_VIEW = 'school.roles.view';
    case SCHOOL_ROLES_CREATE = 'school.roles.create';
    case SCHOOL_ROLES_EDIT = 'school.roles.edit';
    case SCHOOL_ROLES_DELETE = 'school.roles.delete';

    // COURSES
    case SCHOOL_COURSES_INDEX = 'school.courses.index';
    case SCHOOL_COURSES_VIEW = 'school.courses.view';
    case SCHOOL_COURSES_CREATE = 'school.courses.create';
    case SCHOOL_COURSES_EDIT = 'school.courses.edit';
    case SCHOOL_COURSES_DELETE = 'school.courses.delete';

    // BILLING
    case SCHOOL_BILLING_VIEW = 'school.billing.view';
    case SCHOOL_BILLING_EXPORT = 'school.billing.export';

    // SETTINGS (school)
    case SCHOOL_SETTINGS_VIEW = 'school.settings.view';
    case SCHOOL_SETTINGS_EDIT = 'school.settings.edit';

    // -------------------------------------------------------------------------
    // domain() — which dashboard this permission belongs to. A platform role may
    // only be granted PLATFORM permissions; a school role only SCHOOL ones.
    // -------------------------------------------------------------------------
    public function domain(): PermissionDomain
    {
        return match ($this) {
            self::SCHOOL_STAFF_INDEX,
            self::SCHOOL_STAFF_VIEW,
            self::SCHOOL_STAFF_CREATE,
            self::SCHOOL_STAFF_EDIT,
            self::SCHOOL_STAFF_DELETE,
            self::SCHOOL_ROLES_INDEX,
            self::SCHOOL_ROLES_VIEW,
            self::SCHOOL_ROLES_CREATE,
            self::SCHOOL_ROLES_EDIT,
            self::SCHOOL_ROLES_DELETE,
            self::SCHOOL_COURSES_INDEX,
            self::SCHOOL_COURSES_VIEW,
            self::SCHOOL_COURSES_CREATE,
            self::SCHOOL_COURSES_EDIT,
            self::SCHOOL_COURSES_DELETE,
            self::SCHOOL_BILLING_VIEW,
            self::SCHOOL_BILLING_EXPORT,
            self::SCHOOL_SETTINGS_VIEW,
            self::SCHOOL_SETTINGS_EDIT => PermissionDomain::SCHOOL,

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
            self::USERS_DELETE => 'Users',

            self::ROLES_INDEX,
            self::ROLES_VIEW,
            self::ROLES_CREATE,
            self::ROLES_EDIT,
            self::ROLES_DELETE => 'Roles',

            self::PERMISSIONS_INDEX,
            self::PERMISSIONS_EXPORT => 'Permissions',

            self::PLATFORM_SCHOOLS_INDEX,
            self::PLATFORM_SCHOOLS_VIEW,
            self::PLATFORM_SCHOOLS_CREATE,
            self::PLATFORM_SCHOOLS_EDIT,
            self::PLATFORM_SCHOOLS_DELETE => 'Schools',

            self::SETTINGS_INDEX,
            self::SETTINGS_VIEW,
            self::SETTINGS_CREATE,
            self::SETTINGS_EDIT,
            self::SETTINGS_DELETE,
            self::SETTINGS_IMPORT,
            self::SETTINGS_EXPORT,
            self::SETTINGS_PRINT => 'Settings',

            self::SCHOOL_STAFF_INDEX,
            self::SCHOOL_STAFF_VIEW,
            self::SCHOOL_STAFF_CREATE,
            self::SCHOOL_STAFF_EDIT,
            self::SCHOOL_STAFF_DELETE => 'Staff',

            self::SCHOOL_ROLES_INDEX,
            self::SCHOOL_ROLES_VIEW,
            self::SCHOOL_ROLES_CREATE,
            self::SCHOOL_ROLES_EDIT,
            self::SCHOOL_ROLES_DELETE => 'Roles',

            self::SCHOOL_COURSES_INDEX,
            self::SCHOOL_COURSES_VIEW,
            self::SCHOOL_COURSES_CREATE,
            self::SCHOOL_COURSES_EDIT,
            self::SCHOOL_COURSES_DELETE => 'Courses',

            self::SCHOOL_BILLING_VIEW,
            self::SCHOOL_BILLING_EXPORT => 'Billing',

            self::SCHOOL_SETTINGS_VIEW,
            self::SCHOOL_SETTINGS_EDIT => 'Settings',
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
