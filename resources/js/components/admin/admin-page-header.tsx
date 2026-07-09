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
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
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
