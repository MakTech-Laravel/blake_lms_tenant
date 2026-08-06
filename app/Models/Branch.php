<?php

namespace App\Models;

use App\Support\BranchContext;
use Database\Factories\BranchFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Branch
 * ─────────────────────────────────────────────────────────────────────────────
 * A physical location belonging to a school. Branch is a data-scoping concept
 * only: it is never part of Spatie's team key, so a role such as "Manager" is
 * still defined once per school and reused across all of that school's branches.
 *
 * Branches are invisible in the URL — there is no /branch/{branch} segment.
 * Scoping is driven entirely by the authenticated user's `branch_id`.
 *
 * @property int $id
 * @property int $school_id
 * @property string $name
 * @property string $slug
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property bool $is_active
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Branch extends Model
{
    /** @use HasFactory<BranchFactory> */
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'is_active',
    ];

    /**
     * Resolve `{branch}` route bindings by slug rather than id, matching School.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The school this branch belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Staff pinned to this branch. Head-office staff are not included, since
     * their `branch_id` is NULL.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Courses offered by this branch.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Restrict to the branches the current user may see: all of them for a
     * head-office user, only their own for a branch-pinned user.
     *
     * Branch is filtered by its own primary key rather than a `branch_id`
     * column, so it cannot use the BelongsToBranch global scope.
     */
    public function scopeVisibleToCurrentUser(Builder $query): void
    {
        $branchId = BranchContext::pinnedId();

        if ($branchId === null) {
            return;
        }

        $query->whereKey($branchId);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
