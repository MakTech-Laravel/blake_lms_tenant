import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { PlatformSidebar } from '@/components/platform/platform-sidebar';
import type { AppLayoutProps } from '@/types';

export default function PlatformLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <PlatformSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pb-6 md:pb-8">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
