import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <AquaPageHeader
                title="Settings"
                subtitle="Manage your profile and account settings"
            />

            <div
                className="flex w-fit flex-wrap gap-1 rounded-lg bg-navy-50/60 p-1"
                role="tablist"
                aria-label="Settings"
            >
                {sidebarNavItems.map((item, index) => {
                    const active = isCurrentOrParentUrl(item.href);

                    return (
                        <Link
                            key={`${toUrl(item.href)}-${index}`}
                            href={item.href}
                            role="tab"
                            aria-selected={active}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-body-2 text-navy-400 transition-colors hover:text-navy-500',
                                active &&
                                    'bg-white font-semibold text-navy-500 shadow-sm',
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                {children}
            </div>
        </div>
    );
}
