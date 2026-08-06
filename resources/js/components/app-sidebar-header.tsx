import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    showSearch = false,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    showSearch?: boolean;
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const getInitials = useInitials();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-navy-50 bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-navy-400" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-3">
                {showSearch && (
                    <Input
                        placeholder="Search courses..."
                        className="hidden w-56 border-navy-100 md:flex"
                        readOnly
                    />
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative text-navy-400"
                    aria-label="Notifications"
                >
                    <Bell className="size-5" />
                    <Badge className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] text-white">
                        2
                    </Badge>
                </Button>
                {user && (
                    <Link
                        href="/settings/profile"
                        className="hidden items-center gap-2 sm:flex"
                    >
                        <Avatar className="size-8">
                            <AvatarFallback className="bg-navy-500 text-caption-1 text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                            <p className="text-label-3 font-semibold text-navy-500">
                                {user.name}
                            </p>
                            <p className="text-caption-1 text-navy-300">
                                {user.roles?.[0] ?? 'Member'}
                            </p>
                        </div>
                    </Link>
                )}
            </div>
        </header>
    );
}
