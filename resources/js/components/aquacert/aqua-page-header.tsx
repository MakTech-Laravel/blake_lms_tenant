import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AquaPageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
};

export function AquaPageHeader({
    title,
    subtitle,
    actions,
    className,
}: AquaPageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
                className,
            )}
        >
            <div>
                <h1 className="text-h4 font-bold text-navy-500">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-body-2 text-aqua-600">{subtitle}</p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
