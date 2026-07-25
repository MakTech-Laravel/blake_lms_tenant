import { forwardRef, useImperativeHandle } from 'react';

import { IconPickerCollapsible } from '@/components/icons/icon-picker-collapsible';
import { IconPickerDialog } from '@/components/icons/icon-picker-dialog';
import { IconPickerSheet } from '@/components/icons/icon-picker-sheet';
import type {
    LucideIconPickerHandle,
    LucideIconPickerProps,
} from '@/components/icons/lucide-icon-picker-types';
import { useIconPickerState } from '@/components/icons/use-icon-picker-state';
import { cn } from '@/lib/utils';

export type {
    LucideIconPickerClassNames,
    LucideIconPickerDensity,
    LucideIconPickerHandle,
    LucideIconPickerMode,
    LucideIconPickerProps,
    LucideIconPickerTriggerVariant,
} from '@/components/icons/lucide-icon-picker-types';

export const LucideIconPicker = forwardRef<
    LucideIconPickerHandle,
    LucideIconPickerProps
>(function LucideIconPicker(
    {
        name,
        id,
        className,
        classNames,
        defaultValue,
        value,
        onChange,
        label = 'Search icons',
        description = '',
        defaultIcon = 'pen-line',
        defaultOpen = false,
        open,
        onOpenChange,
        disabled = false,
        required = false,
        error,
        placeholder,
        allowedIcons,
        showSparkles = false,
        mode = 'collapsible',
        triggerVariant = 'field',
        density = 'comfortable',
        closeOnSelect = false,
        clearSearchOnSelect = false,
        confirmSelection,
        showRecents = true,
        showCategories = true,
        dialogTitle = 'Choose an icon',
        dialogDescription = 'Browse, filter, and confirm a Lucide icon.',
    },
    ref,
) {
    const state = useIconPickerState({
        id,
        defaultValue,
        value,
        onChange,
        defaultIcon,
        defaultOpen,
        open,
        onOpenChange,
        disabled,
        placeholder,
        allowedIcons,
        closeOnSelect,
        clearSearchOnSelect,
        confirmSelection,
        showRecents,
        mode,
    });

    const { setOpen, clearSearch, focus, displayIcon, triggerRef } = state;

    useImperativeHandle(
        ref,
        () => ({
            open: () => setOpen(true),
            close: () => setOpen(false),
            clearSearch,
            focus,
        }),
        [clearSearch, focus, setOpen],
    );

    const resolvedClassNames = {
        ...classNames,
        wrapper: cn(className, classNames?.wrapper),
    };

    const sharedShellProps = {
        id,
        description: description || displayIcon,
        label,
        disabled,
        error,
        showSparkles,
        showRecents,
        showCategories,
        triggerVariant,
        density,
        classNames: resolvedClassNames,
        state,
        triggerRef,
    };

    return (
        <div className={cn('grid gap-2', resolvedClassNames.wrapper)}>
            {name ? (
                <input
                    type="hidden"
                    name={name}
                    value={displayIcon}
                    required={required}
                    disabled={disabled}
                />
            ) : null}

            {mode === 'dialog' ? (
                <IconPickerDialog
                    {...sharedShellProps}
                    dialogTitle={dialogTitle}
                    dialogDescription={dialogDescription}
                />
            ) : mode === 'sheet' ? (
                <IconPickerSheet
                    {...sharedShellProps}
                    dialogTitle={dialogTitle}
                    dialogDescription={dialogDescription}
                />
            ) : (
                <IconPickerCollapsible {...sharedShellProps} />
            )}

            {error ? (
                <p
                    className={cn(
                        'text-sm text-destructive',
                        resolvedClassNames.error,
                    )}
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
});
