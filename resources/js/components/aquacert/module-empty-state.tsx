import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ModuleEmptyStateProps = {
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export function ModuleEmptyState({
    title = 'Nothing here yet',
    description = 'Items will appear once they are created or assigned.',
    action,
    className,
}: ModuleEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-navy-100 bg-navy-50/40 px-6 py-16 text-center',
                className,
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-aqua-50 text-aqua-600">
                <Inbox className="size-6" />
            </div>
            <div>
                <p className="text-body-1 font-semibold text-navy-500">
                    {title}
                </p>
                <p className="mt-1 max-w-sm text-body-3 text-navy-300">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
