/**
 * The current school (tenant), shared by HandleInertiaRequests on every
 * `/school/{school}/*` request and null everywhere else.
 */
export interface Tenant {
    id: number;
    name: string;
    slug: string;
}

/** A branch of the current school. */
export interface BranchRef {
    id: number;
    name: string;
    slug: string;
}

/**
 * The branch data-scoping context, shared alongside `school`.
 *
 * `pinned` is null for head-office staff, who see every branch of their school;
 * otherwise it is the single branch the user is restricted to. Branch scoping
 * never appears in the URL — it is driven entirely by the logged-in user.
 */
export interface BranchContext {
    isHeadOffice: boolean;
    pinned: BranchRef | null;
}
