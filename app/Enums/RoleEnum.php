<?php

namespace App\Enums;

enum RoleEnum: string
{
    case SUPER_ADMIN = 'super-admin';
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case EDITOR = 'editor';
    case AUTHOR = 'author';
    case VIEWER = 'viewer';
    case USER = 'user';

    // -------------------------------------------------------------------------
    // guard() — guard name for this role.
    // Must match PermissionEnum::guard() and config/permission.php guard_name.
    // -------------------------------------------------------------------------
    public function guard(): string
    {
        return GuardEnum::WEB->value; // change to 'api' for Passport
    }

    // -------------------------------------------------------------------------
    // permissions() — which Permissions cases this role receives.
    //
    // super-admin returns [] intentionally — Gate::before grants everything.
    // Assigning all permissions to super-admin would bloat the pivot table.
    //
    // Add or remove cases here when role permissions change.
    // Re-run: php artisan db:seed --class=RoleSeeder
    // -------------------------------------------------------------------------
    public function permissions(): array
    {
        return match ($this) {
            self::SUPER_ADMIN => [],    // Gate::before handles this

            self::ADMIN => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::REPOSITORY_VIEW,
                PermissionEnum::DOCUMENTATION_VIEW,

                PermissionEnum::FILE_UPLOAD_INDEX,
                PermissionEnum::FILE_UPLOAD_STORE,

                PermissionEnum::POSTS_VIEW,
                PermissionEnum::POSTS_CREATE,
                PermissionEnum::POSTS_EDIT,
                PermissionEnum::POSTS_DELETE,
                PermissionEnum::POSTS_PUBLISH,

                PermissionEnum::USERS_INDEX,
                PermissionEnum::USERS_VIEW,
                PermissionEnum::USERS_CREATE,
                PermissionEnum::USERS_EDIT,
                PermissionEnum::USERS_DELETE,
                PermissionEnum::USERS_IMPERSONATE,

                PermissionEnum::ROLES_INDEX,
                PermissionEnum::ROLES_VIEW,
                PermissionEnum::ROLES_CREATE,
                PermissionEnum::ROLES_EDIT,
                PermissionEnum::ROLES_DELETE,

                PermissionEnum::PERMISSIONS_INDEX,
                PermissionEnum::PERMISSIONS_EXPORT,

                PermissionEnum::PLATFORM_SCHOOLS_INDEX,
                PermissionEnum::PLATFORM_SCHOOLS_VIEW,
                PermissionEnum::PLATFORM_SCHOOLS_CREATE,
                PermissionEnum::PLATFORM_SCHOOLS_EDIT,
                PermissionEnum::PLATFORM_SCHOOLS_DELETE,

                PermissionEnum::PLATFORM_LOCATIONS_INDEX,
                PermissionEnum::PLATFORM_LOCATIONS_VIEW,
                PermissionEnum::PLATFORM_LOCATIONS_CREATE,
                PermissionEnum::PLATFORM_LOCATIONS_EDIT,
                PermissionEnum::PLATFORM_LOCATIONS_DELETE,

                PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_VIEW,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_CREATE,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_EDIT,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_DELETE,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_EXPORT,

                PermissionEnum::PLATFORM_LEARNING_INDEX,
                PermissionEnum::PLATFORM_LEARNING_VIEW,
                PermissionEnum::PLATFORM_LEARNING_CREATE,
                PermissionEnum::PLATFORM_LEARNING_EDIT,
                PermissionEnum::PLATFORM_LEARNING_DELETE,
                PermissionEnum::PLATFORM_LEARNING_PUBLISH,

                PermissionEnum::PLATFORM_PATHWAYS_INDEX,
                PermissionEnum::PLATFORM_PATHWAYS_VIEW,
                PermissionEnum::PLATFORM_PATHWAYS_CREATE,
                PermissionEnum::PLATFORM_PATHWAYS_EDIT,
                PermissionEnum::PLATFORM_PATHWAYS_DELETE,
                PermissionEnum::PLATFORM_PATHWAYS_ASSIGN,

                PermissionEnum::PLATFORM_ASSESSMENTS_INDEX,
                PermissionEnum::PLATFORM_ASSESSMENTS_VIEW,
                PermissionEnum::PLATFORM_ASSESSMENTS_CREATE,
                PermissionEnum::PLATFORM_ASSESSMENTS_EDIT,
                PermissionEnum::PLATFORM_ASSESSMENTS_DELETE,
                PermissionEnum::PLATFORM_ASSESSMENTS_PUBLISH,

                PermissionEnum::PLATFORM_CERTIFICATES_INDEX,
                PermissionEnum::PLATFORM_CERTIFICATES_VIEW,
                PermissionEnum::PLATFORM_CERTIFICATES_ISSUE,
                PermissionEnum::PLATFORM_CERTIFICATES_DOWNLOAD,
                PermissionEnum::PLATFORM_CERTIFICATES_REVOKE,
                PermissionEnum::PLATFORM_CERTIFICATES_TEMPLATES_MANAGE,

                PermissionEnum::PLATFORM_REPORTS_INDEX,
                PermissionEnum::PLATFORM_REPORTS_VIEW,
                PermissionEnum::PLATFORM_REPORTS_CREATE,
                PermissionEnum::PLATFORM_REPORTS_RUN,
                PermissionEnum::PLATFORM_REPORTS_EXPORT,

                PermissionEnum::PLATFORM_NOTIFICATIONS_INDEX,
                PermissionEnum::PLATFORM_NOTIFICATIONS_VIEW,
                PermissionEnum::PLATFORM_NOTIFICATIONS_SEND,
                PermissionEnum::PLATFORM_NOTIFICATIONS_EDIT,
                PermissionEnum::PLATFORM_NOTIFICATIONS_DELETE,

                PermissionEnum::PLATFORM_SUPPORT_INDEX,
                PermissionEnum::PLATFORM_SUPPORT_IMPERSONATE,
                PermissionEnum::PLATFORM_SUPPORT_AUDIT_EXPORT,
                PermissionEnum::PLATFORM_SUPPORT_PASSWORD_RESET,
                PermissionEnum::PLATFORM_SUPPORT_FEATURE_FLAGS,

                PermissionEnum::PLATFORM_SYSTEM_SECURITY_EDIT,
                PermissionEnum::PLATFORM_SYSTEM_INTEGRATIONS_EDIT,
                PermissionEnum::PLATFORM_SYSTEM_BILLING_VIEW,

                PermissionEnum::SETTINGS_VIEW,
                PermissionEnum::SETTINGS_EDIT,
                PermissionEnum::SETTINGS_EXPORT,
            ],

            self::MANAGER => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::PLATFORM_SCHOOLS_INDEX,
                PermissionEnum::PLATFORM_SCHOOLS_VIEW,
                PermissionEnum::USERS_INDEX,
                PermissionEnum::USERS_VIEW,
                PermissionEnum::PLATFORM_LOCATIONS_INDEX,
                PermissionEnum::PLATFORM_LOCATIONS_VIEW,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_INDEX,
                PermissionEnum::PLATFORM_SUBSCRIPTIONS_VIEW,
                PermissionEnum::PLATFORM_LEARNING_INDEX,
                PermissionEnum::PLATFORM_LEARNING_VIEW,
                PermissionEnum::PLATFORM_PATHWAYS_INDEX,
                PermissionEnum::PLATFORM_PATHWAYS_VIEW,
                PermissionEnum::PLATFORM_ASSESSMENTS_INDEX,
                PermissionEnum::PLATFORM_ASSESSMENTS_VIEW,
                PermissionEnum::PLATFORM_CERTIFICATES_INDEX,
                PermissionEnum::PLATFORM_CERTIFICATES_VIEW,
                PermissionEnum::PLATFORM_CERTIFICATES_DOWNLOAD,
                PermissionEnum::PLATFORM_REPORTS_INDEX,
                PermissionEnum::PLATFORM_REPORTS_VIEW,
                PermissionEnum::PLATFORM_NOTIFICATIONS_INDEX,
                PermissionEnum::PLATFORM_NOTIFICATIONS_VIEW,
            ],

            self::EDITOR => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::POSTS_VIEW,
                PermissionEnum::POSTS_CREATE,
                PermissionEnum::POSTS_EDIT,
                PermissionEnum::POSTS_PUBLISH,
                PermissionEnum::FILE_UPLOAD_INDEX,
                PermissionEnum::FILE_UPLOAD_STORE,
            ],

            self::AUTHOR => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::POSTS_VIEW,
                PermissionEnum::POSTS_CREATE,
                PermissionEnum::POSTS_EDIT,
            ],

            self::VIEWER => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::POSTS_VIEW,
            ],

            self::USER => [
                PermissionEnum::DASHBOARD_VIEW,
                PermissionEnum::POSTS_VIEW,
            ],
        };
    }
}
