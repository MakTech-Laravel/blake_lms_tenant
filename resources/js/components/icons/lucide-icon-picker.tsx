import { ChevronDown, Search, Sparkles } from 'lucide-react';
import {
    useDeferredValue,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

import { VirtualIconGrid } from '@/components/icons/virtual-icon-grid';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    getIconLabel,
    isValidLucideIconKey,
    resolveIconKey,
    Icon,
} from '@/lib/icons';
import { prefetchLucideIcons } from '@/lib/lucide-icon-cache';
import { cn } from '@/lib/utils';

type CatalogIconOption = {
    key: string;
    label: string;
    searchText: string;
};

export type LucideIconPickerProps = {
    name?: string;
    id?: string;
    className?: string;
    defaultValue?: string | null;
    value?: string;
    onChange?: (icon: string) => void;
    label?: string;
    description?: string;
    defaultIcon?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    placeholder?: string;
    allowedIcons?: string[];
    showSparkles?: boolean;
};

export function LucideIconPicker({
    name,
    id,
    className,
    defaultValue,
    value,
    onChange,
    label = 'Choose an icon',
    description = 'Selected icon',
    defaultIcon = 'pen-line',
    defaultOpen = false,
    disabled = false,
    required = false,
    error,
    placeholder,
    allowedIcons,
    showSparkles = false,
}: LucideIconPickerProps) {
    const reactId = useId();
    const searchId = id ? `${id}-search` : `${reactId}-search`;
    const gridId = id ? `${id}-grid` : `${reactId}-grid`;
    const statusId = id ? `${id}-status` : `${reactId}-status`;
    const triggerRef = useRef<HTMLButtonElement>(null);

    const isControlled = value !== undefined;
    const [selected, setSelected] = useState(() =>
        resolveIconKey(
            isControlled ? value : (defaultValue ?? defaultIcon),
        ),
    );
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [open, setOpen] = useState(defaultOpen);
    const [catalog, setCatalog] = useState<readonly CatalogIconOption[] | null>(
        null,
    );
    const catalogLoading = (open || defaultOpen) && catalog === null;

    useEffect(() => {
        void prefetchLucideIcons([
            isControlled ? resolveIconKey(value) : selected,
        ]);
    }, [isControlled, selected, value]);

    useEffect(() => {
        if ((!open && !defaultOpen) || catalog) {
            return;
        }

        let cancelled = false;

        void import('@/lib/icon-catalog')
            .then((module) => {
                if (!cancelled) {
                    setCatalog(
                        module.ICON_OPTIONS as readonly CatalogIconOption[],
                    );
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalog([]);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [catalog, defaultOpen, open]);

    const allowedSet = useMemo(() => {
        if (!allowedIcons || allowedIcons.length === 0) {
            return null;
        }

        return new Set(allowedIcons);
    }, [allowedIcons]);

    const baseOptions = useMemo(() => {
        if (!catalog) {
            return [] as CatalogIconOption[];
        }

        if (!allowedSet) {
            return [...catalog];
        }

        return catalog.filter((option) => allowedSet.has(option.key));
    }, [allowedSet, catalog]);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        if (normalizedQuery === '') {
            return baseOptions;
        }

        return baseOptions.filter((option) =>
            option.searchText.includes(normalizedQuery),
        );
    }, [baseOptions, deferredQuery]);

    const isSearchPending = query !== deferredQuery;

    const selectIcon = (key: string) => {
        if (disabled) {
            return;
        }

        if (!isControlled) {
            setSelected(key);
        }

        onChange?.(key);
        setOpen(false);
        setQuery('');
        triggerRef.current?.focus();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (disabled) {
            return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
            setQuery('');
        }
    };

    const displayIcon = isControlled ? resolveIconKey(value) : selected;

    const displayLabel = useMemo(() => {
        const fromCatalog = catalog?.find(
            (option) => option.key === displayIcon,
        )?.label;

        return fromCatalog ?? getIconLabel(displayIcon);
    }, [catalog, displayIcon]);

    const hadInvalidDefault =
        defaultValue != null &&
        defaultValue !== '' &&
        !isValidLucideIconKey(defaultValue);

    const statusMessage = catalogLoading
        ? 'Loading icons…'
        : filteredOptions.length === 0
          ? 'No icons match your search.'
          : `${filteredOptions.length.toLocaleString()} icons`;

    const searchPlaceholder =
        placeholder ??
        (catalog
            ? `Search ${baseOptions.length.toLocaleString()} icons…`
            : 'Search icons…');

    return (
        <div className={cn('grid gap-2', className)}>
            {name ? (
                <input
                    type="hidden"
                    name={name}
                    value={displayIcon}
                    required={required}
                    disabled={disabled}
                />
            ) : null}

            <Collapsible open={open} onOpenChange={handleOpenChange}>
                <div
                    className={cn(
                        'overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-muted/20 via-background to-muted/10 shadow-sm',
                        disabled && 'pointer-events-none opacity-60',
                        error && 'border-destructive/60',
                    )}
                >
                    <CollapsibleTrigger asChild>
                        <button
                            ref={triggerRef}
                            id={id}
                            type="button"
                            disabled={disabled}
                            aria-expanded={open}
                            aria-controls={gridId}
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? statusId : undefined}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:cursor-not-allowed"
                        >
                            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background shadow-sm">
                                <Icon
                                    icon={displayIcon}
                                    className="size-5 text-primary"
                                />
                                {showSparkles ? (
                                    <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Sparkles className="size-2.5" />
                                    </span>
                                ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {displayLabel}
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
                                <p className="text-xs text-amber-700 dark:text-amber-400">
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
                                        onKeyDown={(event) => {
                                            if (event.key === 'Escape') {
                                                event.preventDefault();
                                                handleOpenChange(false);
                                                triggerRef.current?.focus();
                                            }
                                        }}
                                        placeholder={searchPlaceholder}
                                        className="bg-background pl-9"
                                        autoComplete="off"
                                        disabled={disabled || catalogLoading}
                                        aria-controls={gridId}
                                        aria-describedby={statusId}
                                    />
                                </div>
                            </div>

                            <p
                                id={statusId}
                                className="text-xs text-muted-foreground"
                                aria-live="polite"
                            >
                                {error ? error : statusMessage}
                                {isSearchPending ? ' Updating…' : ''}
                            </p>

                            {catalogLoading ? (
                                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground">
                                    Loading icon catalog…
                                </div>
                            ) : filteredOptions.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                                    No icons match your search.
                                </p>
                            ) : (
                                <div
                                    className={cn(
                                        isSearchPending && 'opacity-70',
                                    )}
                                >
                                    <VirtualIconGrid
                                        key={deferredQuery.trim().toLowerCase()}
                                        id={gridId}
                                        options={filteredOptions}
                                        selected={displayIcon}
                                        onSelect={selectIcon}
                                        onEscape={() => {
                                            handleOpenChange(false);
                                            triggerRef.current?.focus();
                                        }}
                                        disabled={disabled}
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>

            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
