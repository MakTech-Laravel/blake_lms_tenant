import { Search } from 'lucide-react';

import type {
    CatalogIconOption,
    LucideIconPickerClassNames,
} from '@/components/icons/lucide-icon-picker-types';
import { VirtualIconGrid } from '@/components/icons/virtual-icon-grid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type IconPickerPanelProps = {
    searchId: string;
    gridId: string;
    statusId: string;
    label: string;
    query: string;
    onQueryChange: (query: string) => void;
    onEscape: () => void;
    searchPlaceholder: string;
    disabled?: boolean;
    catalogLoading: boolean;
    statusMessage: string;
    error?: string;
    isSearchPending: boolean;
    hadInvalidDefault: boolean;
    filteredOptions: CatalogIconOption[];
    deferredQuery: string;
    displayIcon: string;
    onSelect: (key: string) => void;
    classNames?: LucideIconPickerClassNames;
};

export function IconPickerPanel({
    searchId,
    gridId,
    statusId,
    label,
    query,
    onQueryChange,
    onEscape,
    searchPlaceholder,
    disabled = false,
    catalogLoading,
    statusMessage,
    error,
    isSearchPending,
    hadInvalidDefault,
    filteredOptions,
    deferredQuery,
    displayIcon,
    onSelect,
    classNames,
}: IconPickerPanelProps) {
    return (
        <div
            className={cn('flex flex-col gap-3 p-4', classNames?.panel)}
        >
            {hadInvalidDefault ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    The previous icon was not recognized. Pick one from the list
                    below.
                </p>
            ) : null}

            <div className={cn('grid gap-2', classNames?.search)}>
                <Label htmlFor={searchId}>{label}</Label>
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id={searchId}
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                event.preventDefault();
                                onEscape();
                            }
                        }}
                        placeholder={searchPlaceholder}
                        className={cn(
                            'bg-background pl-9',
                            classNames?.searchInput,
                        )}
                        autoComplete="off"
                        disabled={disabled || catalogLoading}
                        aria-controls={gridId}
                        aria-describedby={statusId}
                    />
                </div>
            </div>

            <p
                id={statusId}
                className={cn(
                    'text-xs text-muted-foreground',
                    classNames?.status,
                )}
                aria-live="polite"
            >
                {error ? error : statusMessage}
                {isSearchPending ? ' Updating…' : ''}
            </p>

            {catalogLoading ? (
                <div
                    className={cn(
                        'flex h-48 items-center justify-center rounded-xl border border-dashed border-border/70 text-sm text-muted-foreground',
                        classNames?.loading,
                    )}
                >
                    Loading icon catalog…
                </div>
            ) : filteredOptions.length === 0 ? (
                <p
                    className={cn(
                        'rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground',
                        classNames?.empty,
                    )}
                >
                    No icons match your search.
                </p>
            ) : (
                <div className={cn(isSearchPending && 'opacity-70')}>
                    <VirtualIconGrid
                        key={deferredQuery.trim().toLowerCase()}
                        id={gridId}
                        options={filteredOptions}
                        selected={displayIcon}
                        onSelect={onSelect}
                        onEscape={onEscape}
                        disabled={disabled}
                        className={classNames?.grid}
                        optionClassName={classNames?.option}
                        optionSelectedClassName={classNames?.optionSelected}
                        optionLabelClassName={classNames?.optionLabel}
                    />
                </div>
            )}
        </div>
    );
}
