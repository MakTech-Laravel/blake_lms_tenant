import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

/**
 * Appearance picker. The product is light-mode only — Dark / System choices are
 * still offered so a previously saved preference can be "changed", but every
 * selection is coerced to light by `useAppearance`.
 */
export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className="space-y-3">
            <div
                className={cn(
                    'inline-flex gap-1 rounded-lg bg-neutral-100 p-1',
                    className,
                )}
                {...props}
            >
                {tabs.map(({ value, icon: Icon, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            appearance === value
                                ? 'bg-white text-navy-500 shadow-xs'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-navy-500',
                        )}
                    >
                        <Icon className="-ml-1 h-4 w-4" />
                        <span className="ml-1.5 text-sm">{label}</span>
                    </button>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">
                AquaCert is light-mode only. Choosing Dark or System still
                applies Light across every layout.
            </p>
        </div>
    );
}
