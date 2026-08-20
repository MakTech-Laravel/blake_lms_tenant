import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tones: Record<string, string> = {
    Active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Trial: 'border-orange-200 bg-orange-50 text-orange-700',
    Suspended: 'border-red-200 bg-red-50 text-red-700',
    Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'In Progress': 'border-aqua-200 bg-aqua-50 text-aqua-700',
    'Not Started': 'border-navy-100 bg-navy-50 text-navy-400',
    Overdue: 'border-red-200 bg-red-50 text-red-700',
    Valid: 'border-aqua-200 bg-aqua-50 text-aqua-700',
    Pending: 'border-amber-200 bg-amber-50 text-amber-700',
    Disabled: 'border-red-200 bg-red-50 text-red-700',
    Expired: 'border-red-200 bg-red-50 text-red-700',
    Revoked: 'border-navy-100 bg-navy-50 text-navy-300',
    Inactive: 'border-navy-100 bg-navy-50 text-navy-400',
    Archived: 'border-navy-200 bg-navy-100/60 text-navy-500',
    // Announcement lifecycle. Scheduled reads amber because it is waiting on
    // something; Sending is aqua because it is in flight right now.
    Draft: 'border-navy-100 bg-navy-50 text-navy-400',
    Scheduled: 'border-amber-200 bg-amber-50 text-amber-700',
    Sending: 'border-aqua-200 bg-aqua-50 text-aqua-700',
    Sent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Failed: 'border-red-200 bg-red-50 text-red-700',
    // Announcement priority.
    Normal: 'border-navy-100 bg-navy-50 text-navy-400',
    High: 'border-orange-200 bg-orange-50 text-orange-700',
    Urgent: 'border-red-200 bg-red-50 text-red-700',
};

type StatusBadgeProps = {
    status: string;
    className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-2.5 py-0.5 text-caption-1 font-semibold',
                tones[status] ?? 'border-navy-100 bg-navy-50 text-navy-400',
                className,
            )}
        >
            {status}
        </Badge>
    );
}
