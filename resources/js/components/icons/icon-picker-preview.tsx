import { Check, ClipboardCopy } from 'lucide-react';
import { useState } from 'react';

import { CachedLucideIcon } from '@/components/icons/cached-lucide-icon';
import type { LucideIconPickerClassNames } from '@/components/icons/lucide-icon-picker-types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconPickerPreviewProps = {
    icon: string;
    label: string;
    layout?: 'rail' | 'bar';
    confirmSelection?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    classNames?: LucideIconPickerClassNames;
};

export function IconPickerPreview({
    icon,
    label,
    layout = 'rail',
    confirmSelection = false,
    onConfirm,
    onCancel,
    classNames,
}: IconPickerPreviewProps) {
    const [copied, setCopied] = useState(false);

    const copyKey = async () => {
        try {
            await navigator.clipboard.writeText(icon);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    if (layout === 'bar') {
        return (
            <div
                className={cn(
                    'flex items-center gap-3 border-t border-border/70 bg-background px-4 py-3',
                    classNames?.preview,
                )}
            >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/30">
                    <CachedLucideIcon name={icon} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                        {icon}
                    </p>
                </div>
                {confirmSelection ? (
                    <div className="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={onConfirm}
                            className={classNames?.confirmButton}
                        >
                            Use icon
                        </Button>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <aside
            className={cn(
                'flex h-full flex-col gap-4 border-l border-border/70 bg-muted/15 p-5',
                classNames?.preview,
            )}
        >
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <div className="flex size-24 items-center justify-center rounded-2xl border border-border/70 bg-background shadow-xs">
                    <CachedLucideIcon name={icon} className="size-12" />
                </div>
                <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold text-foreground">
                        {label}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                        {icon}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void copyKey()}
                >
                    {copied ? (
                        <Check className="size-3.5" />
                    ) : (
                        <ClipboardCopy className="size-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy key'}
                </Button>
            </div>

            {confirmSelection ? (
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className={cn('w-full', classNames?.confirmButton)}
                    >
                        Use icon
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </div>
            ) : null}
        </aside>
    );
}
