<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Only a super-admin may modify a super-admin account.
     *
     * (Super-admin actors are already short-circuited to `true` by the
     * Gate::before hook; this keeps the rule explicit and self-contained.)
     */
    public function update(User $actor, User $target): bool
    {
        return ! $target->isSuperAdmin() || $actor->isSuperAdmin();
    }

    /**
     * Only a super-admin may delete a super-admin account.
     */
    public function delete(User $actor, User $target): bool
    {
        return ! $target->isSuperAdmin() || $actor->isSuperAdmin();
    }
}
