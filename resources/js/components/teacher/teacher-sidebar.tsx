import { Link } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    LayoutGrid,
    Settings,
    UserRound,
} from 'lucide-react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import { NavUser } from '@/components/nav-user';
import { SidebarNav } from '@/components/navigation';
import type { NavNode } from '@/components/navigation';
import { Progress } from '@/components/ui/progress';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { learnerOverview } from '@/data/aquacert-fixtures';
import { dashboard } from '@/routes';

const mainNav: NavNode[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'My Learning', href: '/dashboard/learning', icon: BookOpen },
    { title: 'Certificates', href: '/dashboard/certificates', icon: Award },
    { title: 'Profile', href: '/dashboard/profile', icon: UserRound },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function TeacherSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-navy-700 bg-navy-500 text-white **:data-[slot=sidebar-inner]:bg-navy-500"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="text-white hover:bg-navy-400 hover:text-white"
                        >
                            <Link href={dashboard()} prefetch>
                                <AquaCertLogo variant="light" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarNav
                    items={mainNav}
                    label="Learning"
                    classNames={{
                        row: 'text-navy-100 hover:bg-navy-400 hover:text-white data-[active=true]:bg-navy-400 data-[active=true]:text-white',
                    }}
                />
            </SidebarContent>

            <SidebarFooter className="gap-3">
                <div className="mx-2 hidden rounded-xl bg-navy-600 p-3 group-data-[collapsible=icon]:hidden">
                    <p className="text-caption-1 font-semibold text-navy-100">
                        Overall Progress
                    </p>
                    <p className="mt-1 text-label-3 text-white">
                        {learnerOverview.progress.overall}% —{' '}
                        {learnerOverview.progress.coursesDone}
                    </p>
                    <Progress
                        value={learnerOverview.progress.overall}
                        className="mt-2 h-2 bg-navy-400"
                    />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
