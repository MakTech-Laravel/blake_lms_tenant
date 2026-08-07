<?php

namespace App\Policies;

use App\Enums\UserType;
use App\Models\User;
use App\Support\SuperAdmin;

class UserPolicy
{
    /**
     * Only a super-admin may modify a super-admin account in the same dashboard.
     */
    public function update(User $actor, User $target): bool
    {
        if (! SuperAdmin::isSuperAdminUser($target)) {
            return true;
        }

        // Platform super-admins may only be updated by platform super-admins.
        if ($target->type === UserType::PLATFORM) {
            return SuperAdmin::isSuperAdminUser($actor)
                && $actor->type === UserType::PLATFORM;
        }

        // School super-admins: school peers, or platform super-admins.
        if ($target->type === UserType::SCHOOL) {
            if ($actor->type === UserType::PLATFORM) {
                return SuperAdmin::isSuperAdminUser($actor);
            }

            return SuperAdmin::isSuperAdminUser($actor)
                && $actor->school_id === $target->school_id;
        }

        return false;
    }

    /**
     * Delete rules:
     * - Platform super-admin: only a platform super-admin may delete them.
     * - School super-admin: school super-admin peers, OR any platform user
     *   (permission middleware still requires users.delete).
     * - Non-super-admin targets: allowed (middleware gates the ability).
     */
    public function delete(User $actor, User $target): bool
    {
        if (! SuperAdmin::isSuperAdminUser($target)) {
            return true;
        }

        if ($target->type === UserType::PLATFORM) {
            return $actor->type === UserType::PLATFORM
                && SuperAdmin::isSuperAdminUser($actor);
        }

        if ($target->type === UserType::SCHOOL) {
            if ($actor->type === UserType::PLATFORM) {
                return true;
            }

            return SuperAdmin::isSuperAdminUser($actor)
                && $actor->school_id === $target->school_id;
        }

        return false;
    }
}
