import { ChevronDown, Sparkles } from 'lucide-react';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import type { LucideIconPickerClassNames } from '@/components/icons/lucide-icon-picker-types';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

type IconPickerTriggerProps = {
    open: boolean;
    displayIcon: string;
    displayLabel: string;
    description: string;
    showSparkles?: boolean;
    /** Validation message — used for aria-invalid / aria-describedby only. */
    error?: string;
    gridId: string;
    statusId: string;
    classNames?: LucideIconPickerClassNames;
    mode: 'collapsible' | 'dialog';
    ref?: Ref<HTMLButtonElement>;
} & Omit<ComponentPropsWithoutRef<'button'>, 'children'>;

export function IconPickerTrigger({
    id,
    open,
    disabled,
    displayIcon,
    displayLabel,
    description,
    showSparkles = false,
    error,
    gridId,
    statusId,
    classNames,
    mode,
    className,
    ref,
    type = 'button',
    ...props
}: IconPickerTriggerProps) {
    const actionLabel =
        mode === 'dialog'
            ? open
                ? 'Close'
                : 'Choose icon'
            : open
              ? 'Hide icons'
              : 'Change icon';

    return (
        <button
            {...props}
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            aria-expanded={open}
            aria-controls={gridId}
            aria-haspopup={mode === 'dialog' ? 'dialog' : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? statusId : undefined}
            className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:cursor-not-allowed',
                classNames?.trigger,
                className,
            )}
        >
            <div
                className={cn(
                    'relative flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm',
                    classNames?.triggerPreview,
                )}
            >
                <Icon icon={displayIcon} className="size-5 text-primary" />
                {showSparkles ? (
                    <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Sparkles className="size-2.5" />
                    </span>
                ) : null}
            </div>
            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        'truncate text-sm font-medium text-foreground',
                        classNames?.triggerLabel,
                    )}
                >
                    {displayLabel}
                </p>
                <p
                    className={cn(
                        'truncate text-xs text-muted-foreground',
                        classNames?.triggerDescription,
                    )}
                >
                    {description}
                </p>
            </div>
            <div
                className={cn(
                    'flex shrink-0 items-center gap-2',
                    classNames?.triggerAction,
                )}
            >
                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                    {actionLabel}
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 text-muted-foreground transition-transform duration-200',
                        open && mode === 'collapsible' && 'rotate-180',
                    )}
                />
            </div>
        </button>
    );
}
