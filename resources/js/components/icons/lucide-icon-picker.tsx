import { forwardRef, useImperativeHandle } from 'react';

import { IconPickerCollapsible } from '@/components/icons/icon-picker-collapsible';
import { IconPickerDialog } from '@/components/icons/icon-picker-dialog';
import type {
    LucideIconPickerHandle,
    LucideIconPickerProps,
} from '@/components/icons/lucide-icon-picker-types';
import { useIconPickerState } from '@/components/icons/use-icon-picker-state';
import { cn } from '@/lib/utils';

export type {
    LucideIconPickerClassNames,
    LucideIconPickerHandle,
    LucideIconPickerMode,
    LucideIconPickerProps,
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
        label = 'Choose an icon',
        description = 'Selected icon',
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
        closeOnSelect = false,
        clearSearchOnSelect = false,
        dialogTitle = 'Choose an icon',
        dialogDescription = 'Search and select a Lucide icon.',
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
                    id={id}
                    description={description}
                    label={label}
                    disabled={disabled}
                    error={error}
                    showSparkles={showSparkles}
                    classNames={resolvedClassNames}
                    dialogTitle={dialogTitle}
                    dialogDescription={dialogDescription}
                    state={state}
                    triggerRef={triggerRef}
                />
            ) : (
                <IconPickerCollapsible
                    id={id}
                    description={description}
                    label={label}
                    disabled={disabled}
                    error={error}
                    showSparkles={showSparkles}
                    classNames={resolvedClassNames}
                    state={state}
                    triggerRef={triggerRef}
                />
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
