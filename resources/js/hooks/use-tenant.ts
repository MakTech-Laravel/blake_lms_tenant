import { usePage } from '@inertiajs/react';
import type { Tenant } from '@/types/tenant';

/**
 * The current school (tenant) within the school dashboard.
 *
 * Shared by HandleInertiaRequests on every `/school/{school}/*` request. Throws
 * if used outside a school context so misuse fails loudly during development.
 */
export function useTenant(): Tenant {
    const { school } = usePage().props;

    if (!school) {
        throw new Error('useTenant() was called outside the school dashboard.');
    }

    return school;
}
