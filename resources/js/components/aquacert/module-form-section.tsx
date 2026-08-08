import type { ReactNode } from 'react';
import { SectionCard } from '@/components/aquacert/section-card';
import { cn } from '@/lib/utils';

type ModuleFormSectionProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

export function ModuleFormSection({
    title,
    children,
    className,
}: ModuleFormSectionProps) {
    return (
        <SectionCard title={title} className={cn(className)}>
            <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        </SectionCard>
    );
}
