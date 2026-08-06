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

const mainNav: NavNode[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    {
        title: 'Organizations',
        href: '/platform/organizations',
        icon: Building2,
    },
    { title: 'Locations', href: '/platform/locations', icon: MapPin },
    {
        title: 'Subscriptions',
        href: '/platform/subscriptions',
        icon: CreditCard,
    },
    { title: 'People', href: '/platform/people', icon: Users },
    { title: 'Roles & Permissions', href: '/platform/access', icon: Shield },
    { title: 'Learning', href: '/platform/learning', icon: BookOpen },
    { title: 'Learning Pathways', href: '/platform/pathways', icon: Route },
    {
        title: 'Assessments',
        href: '/platform/assessments',
        icon: ClipboardCheck,
    },
    {
        title: 'Certificates',
        href: '/platform/certificates',
        icon: FileBadge2,
    },
    { title: 'Reports', href: '/platform/reports', icon: GitBranch },
    { title: 'Notifications', href: '/platform/notifications', icon: Bell },
    { title: 'Support Tools', href: '/platform/support', icon: LifeBuoy },
    {
        title: 'System Settings',
        href: '/platform/system-settings',
        icon: Settings,
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
