<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

/**
 * BranchContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Resolves the branch the current request is pinned to. This is the single
 * source of truth for the branch data-scoping layer.
 *
 * Branch is deliberately *not* part of Spatie's team key — roles and
 * permissions stay scoped to `school_id` alone. Branch only decides which
 * records a user may see.
 *
 * The value is read from the authenticated user and never from request input,
 * so a branch-pinned user cannot widen their own scope. The optional branch
 * filter offered to head-office users is applied separately in the controllers
 * as an ordinary query filter.
 */
class BranchContext
{
    /**
     * The branch the current user is pinned to, or NULL for head-office
     * (school-wide) access.
     *
     * NULL is also returned when there is no authenticated user at all, which
     * makes the global scope a no-op in console, queue, and seeder contexts.
     */
    public static function pinnedId(): ?int
    {
        $user = Auth::user();

        return $user instanceof User ? $user->branch_id : null;
    }

    /**
     * Whether the current user has school-wide (head-office) access.
     */
    public static function isHeadOffice(): bool
    {
        return self::pinnedId() === null;
    }
}
