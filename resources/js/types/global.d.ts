import type { Auth } from '@/types/auth';
import type { BranchContext, Tenant } from '@/types/tenant';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            school: Tenant | null;
            branch: BranchContext | null;
            notifications: { unread_count: number } | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
