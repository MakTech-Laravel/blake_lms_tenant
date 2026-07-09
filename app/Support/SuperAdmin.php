<?php

namespace App\Support;

use App\Enums\RoleEnum;
use App\Models\User;

/**
 * Single source of truth for super-admin invariants.
 *
 * Two rules are enforced everywhere through this class:
 *   1. Only a super-admin may grant the super-admin role or act on a
 *      super-admin account.
 *   2. The system must always retain at least one super-admin account.
 */
final class SuperAdmin
{
    /** The protected role name. */
    public static function role(): string
    {
        return RoleEnum::SUPER_ADMIN->value;
    }

    /** Number of accounts currently holding the super-admin role. */
    public static function count(): int
    {
        return User::role(self::role())->count();
    }

    /**
     * Whether the given user is the only remaining super-admin — removing
     * the role from (or deleting) this account would leave the system with none.
     */
    public static function isLast(User $user): bool
    {
        return $user->isSuperAdmin() && self::count() <= 1;
    }

    /**
     * Whether a set of role names contains the super-admin role.
     *
     * @param  array<int, string>  $roles
     */
    public static function isGrantedBy(array $roles): bool
    {
        return in_array(self::role(), $roles, true);
    }
}
