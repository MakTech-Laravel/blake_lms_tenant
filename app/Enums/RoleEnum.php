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

                PermissionEnum::ROLES_INDEX,
                PermissionEnum::ROLES_VIEW,
                PermissionEnum::ROLES_CREATE,
                PermissionEnum::ROLES_EDIT,
                PermissionEnum::ROLES_DELETE,

                PermissionEnum::PERMISSIONS_INDEX,
                PermissionEnum::PERMISSIONS_EXPORT,

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
