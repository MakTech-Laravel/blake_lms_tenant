import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';
import type { AppLayoutProps } from '@/types';

export default function TeacherLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <TeacherSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} showSearch />
                <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pb-6 md:pb-8">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
