import type { Ref } from 'react';

import { IconPickerPanel } from '@/components/icons/icon-picker-panel';
import { IconPickerPreview } from '@/components/icons/icon-picker-preview';
import { IconPickerTrigger } from '@/components/icons/icon-picker-trigger';
import type {
    LucideIconPickerClassNames,
    LucideIconPickerDensity,
    LucideIconPickerTriggerVariant,
} from '@/components/icons/lucide-icon-picker-types';
import type { IconPickerState } from '@/components/icons/use-icon-picker-state';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type IconPickerSheetProps = {
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
    dialogTitle: string;
    dialogDescription: string;
    state: IconPickerState;
    triggerRef: Ref<HTMLButtonElement>;
};

export function IconPickerSheet({
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
    dialogTitle,
    dialogDescription,
    state,
    triggerRef,
}: IconPickerSheetProps) {
    const {
        open,
        setOpen,
        displayIcon,
        displayLabel,
        activeIcon,
        activeLabel,
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
        confirmPending,
        confirmSelection,
        focus,
        category,
        setCategory,
        availableCategories,
        recentOptions,
        pendingIcon,
    } = state;

    return (
        <Sheet
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    focus();
                }
            }}
        >
            <div className={cn(classNames?.shell)}>
                <SheetTrigger asChild>
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
                        mode="sheet"
                        triggerVariant={triggerVariant}
                    />
                </SheetTrigger>
            </div>

            <SheetContent
                side="right"
                className={cn(
                    'flex w-full flex-col gap-0 p-0 sm:max-w-md',
                    classNames?.sheetContent,
                )}
            >
                <SheetHeader className="shrink-0 space-y-1 border-b border-border/70 px-5 py-4 text-left">
                    <SheetTitle>{dialogTitle}</SheetTitle>
                    <SheetDescription>{dialogDescription}</SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
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
                        pendingIcon={pendingIcon}
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

                <IconPickerPreview
                    icon={activeIcon}
                    label={activeLabel}
                    layout="bar"
                    confirmSelection={confirmSelection}
                    onConfirm={confirmPending}
                    onCancel={() => {
                        setOpen(false);
                        focus();
                    }}
                    classNames={classNames}
                />
            </SheetContent>
        </Sheet>
    );
}
