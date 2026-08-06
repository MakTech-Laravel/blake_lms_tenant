import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AquaStatCardProps = {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: string;
    trendTone?: 'up' | 'down' | 'neutral';
    className?: string;
};

export function AquaStatCard({
    label,
    value,
    icon: Icon,
    trend,
    trendTone = 'neutral',
    className,
}: AquaStatCardProps) {
    return (
        <Card
            className={cn(
                'gap-2 border-navy-50 bg-white py-4 shadow-sm',
                className,
            )}
        >
            <div className="flex items-start justify-between px-5">
                <div className="flex items-center gap-2">
                    {Icon && (
                        <span className="flex size-8 items-center justify-center rounded-full bg-aqua-50 text-aqua-600">
                            <Icon className="size-4" />
                        </span>
                    )}
                    <span className="text-label-3 font-medium text-navy-300">
                        {label}
                    </span>
                </div>
                {trend && (
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-caption-1 font-semibold',
                            trendTone === 'up' && 'bg-emerald-50 text-emerald-700',
                            trendTone === 'down' && 'bg-red-50 text-red-600',
                            trendTone === 'neutral' && 'bg-navy-50 text-navy-400',
                        )}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <p className="px-5 text-h5 font-bold tracking-tight text-navy-500">
                {value}
            </p>
        </Card>
    );
}
