import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SchoolSidebar } from '@/components/school/school-sidebar';
import type { AppLayoutProps } from '@/types';

export default function SchoolLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <SchoolSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-canvas pb-6 md:pb-8">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
