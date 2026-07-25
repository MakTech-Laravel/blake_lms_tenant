import { Link } from '@inertiajs/react';
import { Award, BookOpen, LayoutGrid, Sparkles } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import { SidebarNav } from '@/components/navigation';
import type { NavNode } from '@/components/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as iconPickerDemo } from '@/routes/icon-picker-demo';
import teacherCertificates from '@/routes/teacher/certificates';
import teacherCourses from '@/routes/teacher/courses';

// Teachers hold no roles, so this navigation is static — no permission filtering.
const mainNav: NavNode[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'My Courses',
        href: teacherCourses.index(),
        icon: BookOpen,
    },
    {
        title: 'Certificates',
        href: teacherCertificates.index(),
        icon: Award,
    },
    {
        title: 'Icon Picker Demo',
        href: iconPickerDemo(),
        icon: Sparkles,
    },
];

export function TeacherSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav items={mainNav} label="Learning" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
