import { ChevronDown, Search, Sparkles } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';

import { VirtualIconGrid } from '@/components/icons/virtual-icon-grid';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { prefetchLucideIcons } from '@/lib/lucide-icon-cache';
import {
    ICON_OPTIONS,
    getIconLabel,
    isValidLucideIconKey,
    resolveIconKey,
    Icon,
} from '@/lib/icons';
import { cn } from '@/lib/utils';

type LucideIconPickerProps = {
    name?: string;
    defaultValue?: string | null;
    value?: string;
    onChange?: (icon: string) => void;
    label?: string;
    description?: string;
    defaultIcon?: string;
    defaultOpen?: boolean;
};

export function LucideIconPicker({
    name,
    defaultValue,
    value,
    onChange,
    label = 'Choose an icon',
    description = 'Selected icon',
    defaultIcon = 'pen-line',
    defaultOpen = false,
}: LucideIconPickerProps) {
    const searchId = useId();
    const isControlled = value !== undefined;
    const [selected, setSelected] = useState(() =>
        resolveIconKey(
            isControlled ? value : (defaultValue ?? defaultIcon),
        ),
    );
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(defaultOpen);

    useEffect(() => {
        if (isControlled) {
            setSelected(resolveIconKey(value));
        }
    }, [isControlled, value]);

    useEffect(() => {
        void prefetchLucideIcons([selected]);
    }, [selected]);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (normalizedQuery === '') {
            return ICON_OPTIONS;
        }

        return ICON_OPTIONS.filter(
            (option) =>
                option.label.toLowerCase().includes(normalizedQuery) ||
                option.key.includes(normalizedQuery),
        );
    }, [query]);

    const selectIcon = (key: string) => {
        if (!isControlled) {
            setSelected(key);
        }

        onChange?.(key);
        setOpen(false);
        setQuery('');
    };

    const displayIcon = isControlled ? resolveIconKey(value) : selected;

    const hadInvalidDefault =
        defaultValue != null &&
        defaultValue !== '' &&
        !isValidLucideIconKey(defaultValue);

    return (
        <div className="grid gap-2">
            {name ? (
                <input type="hidden" name={name} value={displayIcon} />
            ) : null}

            <Collapsible open={open} onOpenChange={setOpen}>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-muted/20 via-background to-muted/10 shadow-sm">
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                        >
                            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm">
                                <Icon
                                    icon={displayIcon}
                                    className="size-5 text-primary"
                                />
                                <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Sparkles className="size-2.5" />
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {getIconLabel(displayIcon)}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                                    {open ? 'Hide icons' : 'Change icon'}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'size-4 text-muted-foreground transition-transform duration-200',
                                        open && 'rotate-180',
                                    )}
                                />
                            </div>
                        </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="border-t border-border/60 bg-card/50 data-[state=closed]:animate-out data-[state=open]:animate-in">
                        <div className="flex flex-col gap-3 p-4">
                            {hadInvalidDefault ? (
                                <p className="text-xs text-amber-700">
                                    The previous icon was not recognized. Pick
                                    one from the list below.
                                </p>
                            ) : null}

                            <div className="grid gap-2">
                                <Label htmlFor={searchId}>{label}</Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id={searchId}
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder={`Search ${ICON_OPTIONS.length.toLocaleString()} icons…`}
                                        className="bg-background pl-9"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {filteredOptions.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                                    No icons match your search.
                                </p>
                            ) : (
                                <VirtualIconGrid
                                    options={filteredOptions}
                                    selected={displayIcon}
                                    onSelect={selectIcon}
                                />
                            )}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </div>
    );
}
