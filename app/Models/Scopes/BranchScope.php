<?php

namespace App\Models\Scopes;

use App\Support\BranchContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Restricts a branch-owned model to the current user's branch.
 *
 * A no-op for head-office users (`branch_id` NULL), who see every branch of
 * their school. For a branch-pinned user the match is exact: rows belonging to
 * another branch *and* school-wide rows with a NULL `branch_id` are both
 * excluded, so a branch manager never sees head-office-only records.
 *
 * Never attach this scope to the User model. It resolves the branch from the
 * authenticated user, so scoping User would make resolving the authenticated
 * user depend on itself — the session guard's retrieveById() would re-enter
 * indefinitely. User is filtered by the explicit `forCurrentBranch()` scope.
 */
class BranchScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $branchId = BranchContext::pinnedId();

        if ($branchId === null) {
            return;
        }

        $builder->where($model->qualifyColumn('branch_id'), $branchId);
    }
}
