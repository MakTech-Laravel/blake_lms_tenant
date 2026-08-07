import { Link } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Building2,
    ClipboardCheck,
    CreditCard,
    FileBadge2,
    GitBranch,
    LayoutGrid,
    LifeBuoy,
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
import { dashboard } from '@/routes/platform';
import { PERMISSIONS } from '@/types/permissions';

const mainNav: NavNode[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        exact: true,
        permissions: [PERMISSIONS.DASHBOARD.VIEW],
    },
    {
        title: 'Organizations',
        href: '/platform/organizations',
        icon: Building2,
        permissions: [PERMISSIONS.SCHOOLS.INDEX],
    },
    {
        title: 'Locations',
        href: '/platform/locations',
        icon: MapPin,
        permissions: [PERMISSIONS.PLATFORM_LOCATIONS.INDEX],
    },
    {
        title: 'Subscriptions',
        href: '/platform/subscriptions',
        icon: CreditCard,
        permissions: [PERMISSIONS.PLATFORM_SUBSCRIPTIONS.INDEX],
    },
    {
        title: 'People',
        href: '/platform/people',
        icon: Users,
        permissions: [PERMISSIONS.USERS.INDEX],
    },
    {
        title: 'Roles & Permissions',
        href: '/platform/access',
        icon: Shield,
        permissions: [PERMISSIONS.ROLES.INDEX],
    },
    {
        title: 'Learning',
        href: '/platform/learning',
        icon: BookOpen,
        permissions: [PERMISSIONS.PLATFORM_LEARNING.INDEX],
    },
    {
        title: 'Learning Pathways',
        href: '/platform/pathways',
        icon: Route,
        permissions: [PERMISSIONS.PLATFORM_PATHWAYS.INDEX],
    },
    {
        title: 'Assessments',
        href: '/platform/assessments',
        icon: ClipboardCheck,
        permissions: [PERMISSIONS.PLATFORM_ASSESSMENTS.INDEX],
    },
    {
        title: 'Certificates',
        href: '/platform/certificates',
        icon: FileBadge2,
        permissions: [PERMISSIONS.PLATFORM_CERTIFICATES.INDEX],
    },
    {
        title: 'Reports',
        href: '/platform/reports',
        icon: GitBranch,
        permissions: [PERMISSIONS.PLATFORM_REPORTS.INDEX],
    },
    {
        title: 'Notifications',
        href: '/platform/notifications',
        icon: Bell,
        permissions: [PERMISSIONS.PLATFORM_NOTIFICATIONS.INDEX],
    },
    {
        title: 'Support Tools',
        href: '/platform/support',
        icon: LifeBuoy,
        permissions: [PERMISSIONS.PLATFORM_SUPPORT.INDEX],
    },
    {
        title: 'System Settings',
        href: '/platform/system-settings',
        icon: Settings,
        permissions: [PERMISSIONS.SETTINGS.VIEW],
    },
];

export function PlatformSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AquaCertLogo variant="dark" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav
                    items={mainNav}
                    label="Platform"
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
