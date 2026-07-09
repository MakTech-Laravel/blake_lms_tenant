import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
}

/**
 * Compact metric tile shared across the platform, school, and teacher
 * dashboards.
 */
export function StatCard({ label, value, icon: Icon }: StatCardProps) {
    return (
        <Card className="gap-2 py-5">
            <div className="flex items-center justify-between px-6">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <span className="px-6 text-3xl font-semibold tracking-tight">
                {value}
            </span>
        </Card>
    );
}
