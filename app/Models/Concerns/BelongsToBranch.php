<?php

namespace App\Models\Concerns;

use App\Models\Branch;
use App\Models\Scopes\BranchScope;
use App\Support\BranchContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applies branch data-scoping to a model that owns a `branch_id` column.
 *
 * Layered one level below the school: `school_id` continues to isolate tenants
 * (and drives Spatie's team key), while `branch_id` narrows what a branch-pinned
 * user sees inside their own school. Head-office users (`branch_id` NULL) are
 * unaffected.
 *
 * Do not use on the User model — see BranchScope for why.
 *
 * @property int|null $branch_id
 *
 * @mixin Model
 */
trait BelongsToBranch
{
    /**
     * Register the global scope and the create hook.
     *
     * Eloquent calls this automatically via bootTraits(), so a model using this
     * trait does not need to touch its own booted() method.
     */
    public static function bootBelongsToBranch(): void
    {
        static::addGlobalScope(new BranchScope);

        static::creating(function (self $model): void {
            // A branch-pinned user can only create records inside their own
            // branch. Head-office users must set the branch explicitly.
            if ($model->branch_id === null) {
                $model->branch_id = BranchContext::pinnedId();
            }
        });
    }

    /**
     * The branch that owns this record, or NULL when it is school-wide.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Escape hatch for head-office reporting, seeders, and tests that need to
     * reach across branches deliberately.
     */
    public function scopeWithoutBranchScope(Builder $query): void
    {
        $query->withoutGlobalScope(BranchScope::class);
    }

    /**
     * Narrow to a specific branch, for the optional head-office branch filter.
     */
    public function scopeForBranch(Builder $query, ?int $branchId): void
    {
        if ($branchId === null) {
            return;
        }

        $query->where($this->qualifyColumn('branch_id'), $branchId);
    }
}
