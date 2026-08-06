import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: ReactNode;
}

export function AdminPageHeader({
    title,
    description,
    icon: Icon,
    children,
}: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b border-navy-50 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-h5 font-bold tracking-tight text-navy-500">
                    {Icon && <Icon className="h-6 w-6 text-aqua-600" />}
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-body-3 text-aqua-600">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">{children}</div>
            )}
        </div>
    );
}
