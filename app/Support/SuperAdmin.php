<?php

namespace App\Support;

use App\Enums\RoleEnum;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Single source of truth for super-admin invariants.
 *
 * Platform and school super-admins share the role name but live in separate
 * Spatie teams (platform team id 0 vs school id). Helpers here are team-aware.
 */
final class SuperAdmin
{
    /** The protected role name. */
    public static function role(): string
    {
        return RoleEnum::SUPER_ADMIN->value;
    }

    /**
     * Number of accounts holding super-admin in the active Spatie team.
     */
    public static function count(): int
    {
        return User::role(self::role())->count();
    }

    /**
     * Number of super-admins in a specific team (platform or school).
     */
    public static function countInTeam(int $teamId): int
    {
        return DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('roles.name', self::role())
            ->where('model_has_roles.model_type', (new User)->getMorphClass())
            ->where('model_has_roles.school_id', $teamId)
            ->count();
    }

    /**
     * Whether the user holds super-admin in the given team.
     */
    public static function userHasInTeam(User $user, int $teamId): bool
    {
        return DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('roles.name', self::role())
            ->where('model_has_roles.model_type', $user->getMorphClass())
            ->where('model_has_roles.model_id', $user->id)
            ->where('model_has_roles.school_id', $teamId)
            ->exists();
    }

    /**
     * Team id where this user's super-admin (if any) is scoped.
     */
    public static function teamIdFor(User $user): ?int
    {
        if ($user->type === UserType::PLATFORM) {
            return PlatformTeamResolver::PLATFORM_TEAM_ID;
        }

        if ($user->type === UserType::SCHOOL && $user->school_id !== null) {
            return (int) $user->school_id;
        }

        return null;
    }

    /**
     * Whether the user is a super-admin in their own dashboard team.
     */
    public static function isSuperAdminUser(User $user): bool
    {
        $teamId = self::teamIdFor($user);

        return $teamId !== null && self::userHasInTeam($user, $teamId);
    }

    /**
     * Whether removing/deleting this user would leave their team with no super-admin.
     */
    public static function isLast(User $user): bool
    {
        $teamId = self::teamIdFor($user);

        if ($teamId === null || ! self::userHasInTeam($user, $teamId)) {
            return false;
        }

        return self::countInTeam($teamId) <= 1;
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
