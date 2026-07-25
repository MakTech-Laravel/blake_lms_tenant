import { Link } from '@inertiajs/react';
import { BookOpen, LayoutGrid, Shield, Sparkles, Users } from 'lucide-react';
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
import { useTenant } from '@/hooks/use-tenant';
import { index as iconPickerDemo } from '@/routes/icon-picker-demo';
import { dashboard } from '@/routes/school';
import schoolCourses from '@/routes/school/courses';
import schoolRoles from '@/routes/school/roles';
import schoolUsers from '@/routes/school/users';
import { PERMISSIONS } from '@/types/permissions';

export function SchoolSidebar() {
    const school = useTenant();

    // Permission-filtered via SidebarNav. All links are scoped to the current
    // school by passing its slug to the tenant route helpers.
    const mainNav: NavNode[] = [
        {
            title: 'Dashboard',
            href: dashboard(school.slug),
            icon: LayoutGrid,
        },
        {
            title: 'Staff',
            href: schoolUsers.index(school.slug),
            icon: Users,
            permissions: [PERMISSIONS.SCHOOL_STAFF.INDEX],
        },
        {
            title: 'Roles',
            href: schoolRoles.index(school.slug),
            icon: Shield,
            permissions: [PERMISSIONS.SCHOOL_ROLES.INDEX],
        },
        {
            title: 'Courses',
            href: schoolCourses.index(school.slug),
            icon: BookOpen,
            permissions: [PERMISSIONS.SCHOOL_COURSES.INDEX],
        },
        {
            title: 'Icon Picker Demo',
            href: iconPickerDemo(),
            icon: Sparkles,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard(school.slug)} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav items={mainNav} label={school.name} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
