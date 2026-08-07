import { Link } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    ClipboardCheck,
    CreditCard,
    FileBadge2,
    FolderOpen,
    LayoutGrid,
    Library,
    MapPin,
    Route,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
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
import { useBranch } from '@/hooks/use-branch';
import { useTenant } from '@/hooks/use-tenant';
import { dashboard } from '@/routes/school';
import { PERMISSIONS } from '@/types/permissions';

export function SchoolSidebar() {
    const school = useTenant();
    const { isHeadOffice, pinned } = useBranch();
    const base = `/school/${school.slug}`;

    const headOfficeNav: NavNode[] = [
        {
            title: 'Dashboard',
            href: dashboard(school.slug),
            icon: LayoutGrid,
            exact: true,
            permissions: [PERMISSIONS.SCHOOL_DASHBOARD.VIEW],
        },
        {
            title: 'People',
            href: `${base}/people`,
            icon: Users,
            permissions: [PERMISSIONS.SCHOOL_STAFF.INDEX],
        },
        {
            title: 'Roles & Permissions',
            href: `${base}/access`,
            icon: Shield,
            permissions: [PERMISSIONS.SCHOOL_ROLES.INDEX],
        },
        {
            title: 'Locations',
            href: `${base}/locations`,
            icon: MapPin,
            permissions: [PERMISSIONS.SCHOOL_LOCATIONS.INDEX],
        },
        {
            title: 'Courses',
            href: `${base}/courses-ui`,
            icon: BookOpen,
            permissions: [PERMISSIONS.SCHOOL_COURSES.INDEX],
        },
        {
            title: 'Library',
            href: `${base}/library`,
            icon: Library,
            permissions: [PERMISSIONS.SCHOOL_LIBRARY.INDEX],
        },
        {
            title: 'Pathways',
            href: `${base}/pathways`,
            icon: Route,
            permissions: [PERMISSIONS.SCHOOL_PATHWAYS.INDEX],
        },
        {
            title: 'Assignments',
            href: `${base}/assignments`,
            icon: FolderOpen,
            permissions: [PERMISSIONS.SCHOOL_ASSIGNMENTS.INDEX],
        },
        {
            title: 'Assessments',
            href: `${base}/assessments`,
            icon: ClipboardCheck,
            permissions: [PERMISSIONS.SCHOOL_ASSESSMENTS.INDEX],
        },
        {
            title: 'Certificates',
            href: `${base}/certificates`,
            icon: FileBadge2,
            permissions: [PERMISSIONS.SCHOOL_CERTIFICATES.INDEX],
        },
        {
            title: 'Subscriptions',
            href: `${base}/billing`,
            icon: CreditCard,
            permissions: [PERMISSIONS.SCHOOL_BILLING.VIEW],
        },
        {
            title: 'Reports',
            href: `${base}/reports`,
            icon: BookOpen,
            permissions: [PERMISSIONS.SCHOOL_REPORTS.INDEX],
        },
        {
            title: 'Notifications',
            href: `${base}/notifications`,
            icon: Bell,
            permissions: [PERMISSIONS.SCHOOL_NOTIFICATIONS.INDEX],
        },
        {
            title: 'Settings',
            href: `${base}/settings`,
            icon: Settings,
            permissions: [PERMISSIONS.SCHOOL_SETTINGS.VIEW],
        },
    ];

    const branchNav: NavNode[] = [
        {
            title: 'Dashboard',
            href: dashboard(school.slug),
            icon: LayoutGrid,
            exact: true,
            permissions: [PERMISSIONS.SCHOOL_DASHBOARD.VIEW],
        },
        {
            title: 'People',
            href: `${base}/people`,
            icon: Users,
            permissions: [PERMISSIONS.SCHOOL_STAFF.INDEX],
        },
        {
            title: 'Locations',
            href: `${base}/locations`,
            icon: MapPin,
            permissions: [PERMISSIONS.SCHOOL_LOCATIONS.INDEX],
        },
        {
            title: 'Courses',
            href: `${base}/courses-ui`,
            icon: BookOpen,
            permissions: [PERMISSIONS.SCHOOL_COURSES.INDEX],
        },
        {
            title: 'Pathways',
            href: `${base}/pathways`,
            icon: Route,
            permissions: [PERMISSIONS.SCHOOL_PATHWAYS.INDEX],
        },
        {
            title: 'Assignments',
            href: `${base}/assignments`,
            icon: FolderOpen,
            permissions: [PERMISSIONS.SCHOOL_ASSIGNMENTS.INDEX],
        },
        {
            title: 'Assessments',
            href: `${base}/assessments`,
            icon: ClipboardCheck,
            permissions: [PERMISSIONS.SCHOOL_ASSESSMENTS.INDEX],
        },
        {
            title: 'Certificates',
            href: `${base}/certificates`,
            icon: FileBadge2,
            permissions: [PERMISSIONS.SCHOOL_CERTIFICATES.INDEX],
        },
        {
            title: 'Reports',
            href: `${base}/reports`,
            icon: BookOpen,
            permissions: [PERMISSIONS.SCHOOL_REPORTS.INDEX],
        },
        {
            title: 'Notifications',
            href: `${base}/notifications`,
            icon: Bell,
            permissions: [PERMISSIONS.SCHOOL_NOTIFICATIONS.INDEX],
        },
    ];

    const mainNav = isHeadOffice ? headOfficeNav : branchNav;

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard(school.slug)} prefetch>
                                <AquaCertLogo variant="dark" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav
                    items={mainNav}
                    label={
                        pinned ? `${school.name} — ${pinned.name}` : school.name
                    }
                    classNames={{
                        row: 'text-navy-400 data-[active=true]:bg-aqua-50 data-[active=true]:text-navy-500',
                        icon: 'text-navy-300 group-data-[active=true]/menu-button:text-navy-500',
                    }}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
