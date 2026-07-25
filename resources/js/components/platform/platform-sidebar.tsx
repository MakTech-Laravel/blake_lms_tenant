import { Link } from '@inertiajs/react';
import {
    Building2,
    KeyRound,
    LayoutGrid,
    Shield,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
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
import { index as iconPickerDemo } from '@/routes/icon-picker-demo';
import { dashboard } from '@/routes/platform';
import platformPermissions from '@/routes/platform/permissions';
import platformRoles from '@/routes/platform/roles';
import platformSchools from '@/routes/platform/schools';
import platformUsers from '@/routes/platform/users';
import { PERMISSIONS } from '@/types/permissions';

// Platform navigation. Permission-filtered via SidebarNav; the Dashboard entry
// has no gate so every platform account can reach it.
const mainNav: NavNode[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Schools',
        href: platformSchools.index(),
        icon: Building2,
        permissions: [PERMISSIONS.SCHOOLS.INDEX],
    },
    {
        title: 'Access Control',
        icon: ShieldCheck,
        permissions: [
            PERMISSIONS.USERS.INDEX,
            PERMISSIONS.ROLES.INDEX,
            PERMISSIONS.PERMISSIONS.INDEX,
        ],
        items: [
            {
                title: 'Staff',
                href: platformUsers.index(),
                icon: Users,
                permissions: [PERMISSIONS.USERS.INDEX],
            },
            {
                title: 'Roles',
                href: platformRoles.index(),
                icon: Shield,
                permissions: [PERMISSIONS.ROLES.INDEX],
            },
            {
                title: 'Permissions',
                href: platformPermissions.index(),
                icon: KeyRound,
                permissions: [PERMISSIONS.PERMISSIONS.INDEX],
            },
        ],
    },
    {
        title: 'Icon Picker Demo',
        href: iconPickerDemo(),
        icon: Sparkles,
    },
];

export function PlatformSidebar() {
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
                <SidebarNav items={mainNav} label="Platform" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
