import { usePage } from '@inertiajs/react';
import type { BranchContext } from '@/types/tenant';

/**
 * The current branch data-scoping context within the school dashboard.
 *
 * Shared by HandleInertiaRequests on every `/school/{school}/*` request. Use it
 * to hide head-office-only affordances (such as branch management or a branch
 * filter) from staff pinned to a single branch.
 *
 * This is presentation only. Every query is scoped on the server regardless of
 * what the UI chooses to show.
 */
export function useBranch(): BranchContext {
    const { branch } = usePage().props;

    if (!branch) {
        throw new Error('useBranch() was called outside the school dashboard.');
    }

    return branch;
}
