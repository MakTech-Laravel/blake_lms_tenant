import type { Ref } from 'react';

import { IconPickerPanel } from '@/components/icons/icon-picker-panel';
import { IconPickerTrigger } from '@/components/icons/icon-picker-trigger';
import type { LucideIconPickerClassNames } from '@/components/icons/lucide-icon-picker-types';
import type { IconPickerState } from '@/components/icons/use-icon-picker-state';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type IconPickerDialogProps = {
    id?: string;
    description: string;
    label: string;
    disabled?: boolean;
    error?: string;
    showSparkles?: boolean;
    classNames?: LucideIconPickerClassNames;
    dialogTitle: string;
    dialogDescription: string;
    state: IconPickerState;
    triggerRef: Ref<HTMLButtonElement>;
};

export function IconPickerDialog({
    id,
    description,
    label,
    disabled,
    error,
    showSparkles,
    classNames,
    dialogTitle,
    dialogDescription,
    state,
    triggerRef,
}: IconPickerDialogProps) {
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
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    focus();
                }
            }}
        >
            <div
                className={cn(
                    'overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-muted/20 via-background to-muted/10 shadow-sm',
                    disabled && 'pointer-events-none opacity-60',
                    error && 'border-destructive/60',
                    classNames?.shell,
                )}
            >
                <DialogTrigger asChild>
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
                        mode="dialog"
                    />
                </DialogTrigger>
            </div>

            <DialogContent
                className={cn(
                    'flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
                    classNames?.dialogContent,
                )}
            >
                <DialogHeader
                    className={cn(
                        'border-b border-border/60 px-6 py-4 text-left',
                        classNames?.dialogHeader,
                    )}
                >
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

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
                        displayIcon={displayIcon}
                        onSelect={selectIcon}
                        classNames={classNames}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
