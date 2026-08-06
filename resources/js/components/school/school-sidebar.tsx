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

export function SchoolSidebar() {
    const school = useTenant();
    const { isHeadOffice, pinned } = useBranch();
    const base = `/school/${school.slug}`;

    const headOfficeNav: NavNode[] = [
        { title: 'Dashboard', href: dashboard(school.slug), icon: LayoutGrid },
        { title: 'People', href: `${base}/people`, icon: Users },
        { title: 'Roles & Permissions', href: `${base}/access`, icon: Shield },
        { title: 'Locations', href: `${base}/locations`, icon: MapPin },
        { title: 'Courses', href: `${base}/courses-ui`, icon: BookOpen },
        { title: 'Library', href: `${base}/library`, icon: Library },
        { title: 'Pathways', href: `${base}/pathways`, icon: Route },
        { title: 'Assignments', href: `${base}/assignments`, icon: FolderOpen },
        {
            title: 'Assessments',
            href: `${base}/assessments`,
            icon: ClipboardCheck,
        },
        {
            title: 'Certificates',
            href: `${base}/certificates`,
            icon: FileBadge2,
        },
        { title: 'Subscriptions', href: `${base}/billing`, icon: CreditCard },
        { title: 'Reports', href: `${base}/reports`, icon: BookOpen },
        { title: 'Notifications', href: `${base}/notifications`, icon: Bell },
        { title: 'Settings', href: `${base}/settings`, icon: Settings },
    ];

    const branchNav: NavNode[] = [
        { title: 'Dashboard', href: dashboard(school.slug), icon: LayoutGrid },
        { title: 'People', href: `${base}/people`, icon: Users },
        { title: 'Locations', href: `${base}/locations`, icon: MapPin },
        { title: 'Courses', href: `${base}/courses-ui`, icon: BookOpen },
        { title: 'Pathways', href: `${base}/pathways`, icon: Route },
        { title: 'Assignments', href: `${base}/assignments`, icon: FolderOpen },
        {
            title: 'Assessments',
            href: `${base}/assessments`,
            icon: ClipboardCheck,
        },
        {
            title: 'Certificates',
            href: `${base}/certificates`,
            icon: FileBadge2,
        },
        { title: 'Reports', href: `${base}/reports`, icon: BookOpen },
        { title: 'Notifications', href: `${base}/notifications`, icon: Bell },
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
