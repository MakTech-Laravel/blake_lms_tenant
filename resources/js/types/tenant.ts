/**
 * The current school (tenant), shared by HandleInertiaRequests on every
 * `/school/{school}/*` request and null everywhere else.
 */
export interface Tenant {
    id: number;
    name: string;
    slug: string;
}
