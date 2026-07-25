import { useEffect, useRef, type Ref } from 'react';

import { IconPickerPanel } from '@/components/icons/icon-picker-panel';
import { IconPickerTrigger } from '@/components/icons/icon-picker-trigger';
import type {
    LucideIconPickerClassNames,
    LucideIconPickerDensity,
    LucideIconPickerPanelBehavior,
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
    panelBehavior?: LucideIconPickerPanelBehavior;
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
    panelBehavior: panelBehaviorProp,
    density = 'comfortable',
    classNames,
    state,
    triggerRef,
}: IconPickerCollapsibleProps) {
    const panelBehavior =
        panelBehaviorProp ??
        (triggerVariant === 'compact' || triggerVariant === 'ghost'
            ? 'overlay'
            : 'inline');

    const shellRef = useRef<HTMLDivElement>(null);

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
        clearRecents,
    } = state;

    useEffect(() => {
        if (!open || panelBehavior !== 'overlay') {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node | null;

            if (!target || !shellRef.current?.contains(target)) {
                setOpen(false);
                focus();
            }
        };

        document.addEventListener('mousedown', onPointerDown);

        return () => document.removeEventListener('mousedown', onPointerDown);
    }, [focus, open, panelBehavior, setOpen]);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <div
                ref={shellRef}
                className={cn(
                    'relative flex min-w-0 flex-col items-stretch',
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
                        triggerVariant={triggerVariant}
                    />
                </CollapsibleTrigger>

                <CollapsibleContent
                    className={cn(
                        'data-[state=closed]:animate-out data-[state=open]:animate-in',
                        panelBehavior === 'overlay' &&
                            cn(
                                'absolute top-full z-50 mt-2 w-[min(calc(100vw-2rem),22rem)]',
                                triggerVariant === 'compact'
                                    ? 'right-0'
                                    : 'left-0',
                            ),
                        panelBehavior === 'inline' && 'mt-2',
                    )}
                >
                    <div
                        className={cn(
                            'overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground',
                            panelBehavior === 'overlay'
                                ? 'shadow-lg'
                                : 'shadow-xs',
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
                            onClearRecents={clearRecents}
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
