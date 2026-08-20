import {
    AlertTriangle,
    Award,
    BookOpen,
    CreditCard,
    Megaphone,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The icon and tint for each notification category, keyed by enum value.
 *
 * Category is what an announcement is about, so it earns the icon; priority is
 * how loudly it should read, and gets a badge instead. Mixing the two would make
 * an urgent billing notice indistinguishable from an urgent course one.
 */
const CATEGORIES: Record<string, { icon: LucideIcon; tone: string }> = {
    announcement: { icon: Megaphone, tone: 'bg-aqua-50 text-aqua-600' },
    system_alert: { icon: AlertTriangle, tone: 'bg-amber-50 text-amber-600' },
    compliance: { icon: ShieldCheck, tone: 'bg-indigo-50 text-indigo-600' },
    billing: { icon: CreditCard, tone: 'bg-emerald-50 text-emerald-600' },
    course: { icon: BookOpen, tone: 'bg-sky-50 text-sky-600' },
    certificate: { icon: Award, tone: 'bg-violet-50 text-violet-600' },
};

const FALLBACK = { icon: Megaphone, tone: 'bg-navy-50 text-navy-400' };

type NotificationIconProps = {
    category: string;
    className?: string;
    size?: 'sm' | 'md';
};

export function NotificationIcon({
    category,
    className,
    size = 'md',
}: NotificationIconProps) {
    const { icon: Icon, tone } = CATEGORIES[category] ?? FALLBACK;

    return (
        <span
            className={cn(
                'flex shrink-0 items-center justify-center rounded-full',
                size === 'md' ? 'size-10' : 'size-8',
                tone,
                className,
            )}
            aria-hidden
        >
            <Icon className={size === 'md' ? 'size-5' : 'size-4'} />
        </span>
    );
}
