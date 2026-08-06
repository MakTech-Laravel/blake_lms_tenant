import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SectionCardProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function SectionCard({
    title,
    action,
    children,
    className,
}: SectionCardProps) {
    return (
        <Card className={cn('border-navy-50 bg-white shadow-sm', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-h6 font-semibold text-navy-500">
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
