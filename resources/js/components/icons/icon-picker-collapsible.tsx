import type { Ref } from 'react';

import { IconPickerPanel } from '@/components/icons/icon-picker-panel';
import { IconPickerTrigger } from '@/components/icons/icon-picker-trigger';
import type {
    LucideIconPickerClassNames,
    LucideIconPickerDensity,
    LucideIconPickerTriggerVariant,
} from '@/components/icons/lucide-icon-picker-types';
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
    showRecents?: boolean;
    showCategories?: boolean;
    triggerVariant?: LucideIconPickerTriggerVariant;
    density?: LucideIconPickerDensity;
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
    showRecents = true,
    showCategories = true,
    triggerVariant = 'field',
    density = 'comfortable',
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
        category,
        setCategory,
        availableCategories,
        recentOptions,
    } = state;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div className={cn(classNames?.shell)}>
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
                        triggerVariant={triggerVariant}
                    />
                </CollapsibleTrigger>

                <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in">
                    <div
                        className={cn(
                            'mt-2 overflow-hidden rounded-xl border border-border/70 bg-background shadow-xs',
                            disabled && 'pointer-events-none opacity-60',
                        )}
                    >
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
                            selectedIcon={displayIcon}
                            onSelect={selectIcon}
                            categories={availableCategories}
                            activeCategory={category}
                            onCategoryChange={setCategory}
                            recentOptions={recentOptions}
                            showCategories={showCategories}
                            showRecents={showRecents}
                            density={density}
                            classNames={classNames}
                        />
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
