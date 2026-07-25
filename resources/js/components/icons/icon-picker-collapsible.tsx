import type { Ref } from 'react';

import { IconPickerPanel } from '@/components/icons/icon-picker-panel';
import { IconPickerTrigger } from '@/components/icons/icon-picker-trigger';
import type { LucideIconPickerClassNames } from '@/components/icons/lucide-icon-picker-types';
import type { IconPickerState } from '@/components/icons/use-icon-picker-state';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

type IconPickerCollapsibleProps = {
    id?: string;
    description: string;
    label: string;
    disabled?: boolean;
    error?: string;
    showSparkles?: boolean;
    classNames?: LucideIconPickerClassNames;
    state: IconPickerState;
    triggerRef: Ref<HTMLButtonElement>;
};

export function IconPickerCollapsible({
    id,
    description,
    label,
    disabled,
    error,
    showSparkles,
    classNames,
    state,
    triggerRef,
}: IconPickerCollapsibleProps) {
    const {
        open,
        setOpen,
        displayIcon,
        displayLabel,
        searchId,
        gridId,
        statusId,
        query,
        setQuery,
        searchPlaceholder,
        catalogLoading,
        statusMessage,
        isSearchPending,
        hadInvalidDefault,
        filteredOptions,
        deferredQuery,
        selectIcon,
        focus,
    } = state;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div
                className={cn(
                    'overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-muted/20 via-background to-muted/10 shadow-sm',
                    disabled && 'pointer-events-none opacity-60',
                    error && 'border-destructive/60',
                    classNames?.shell,
                )}
            >
                <CollapsibleTrigger asChild>
                    <IconPickerTrigger
                        ref={triggerRef}
                        id={id}
                        open={open}
                        disabled={disabled}
                        displayIcon={displayIcon}
                        displayLabel={displayLabel}
                        description={description}
                        showSparkles={showSparkles}
                        error={error}
                        gridId={gridId}
                        statusId={statusId}
                        classNames={classNames}
                        mode="collapsible"
                    />
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t border-border/60 bg-card/50 data-[state=closed]:animate-out data-[state=open]:animate-in">
                    <IconPickerPanel
                        searchId={searchId}
                        gridId={gridId}
                        statusId={statusId}
                        label={label}
                        query={query}
                        onQueryChange={setQuery}
                        onEscape={() => {
                            setOpen(false);
                            focus();
                        }}
                        searchPlaceholder={searchPlaceholder}
                        disabled={disabled}
                        catalogLoading={catalogLoading}
                        statusMessage={statusMessage}
                        error={error}
                        isSearchPending={isSearchPending}
                        hadInvalidDefault={hadInvalidDefault}
                        filteredOptions={filteredOptions}
                        deferredQuery={deferredQuery}
                        displayIcon={displayIcon}
                        onSelect={selectIcon}
                        classNames={classNames}
                    />
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
