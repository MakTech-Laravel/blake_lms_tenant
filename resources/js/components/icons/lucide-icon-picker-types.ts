export type LucideIconPickerMode = 'collapsible' | 'dialog' | 'sheet';

export type LucideIconPickerTriggerVariant =
    | 'field'
    | 'compact'
    | 'button'
    | 'ghost';

export type LucideIconPickerDensity = 'comfortable' | 'compact';

/** Per-slot className overrides — pass only what you need. */
export interface LucideIconPickerClassNames {
    wrapper?: string;
    shell?: string;
    trigger?: string;
    triggerPreview?: string;
    triggerLabel?: string;
    triggerDescription?: string;
    triggerAction?: string;
    panel?: string;
    search?: string;
    searchInput?: string;
    status?: string;
    loading?: string;
    empty?: string;
    grid?: string;
    option?: string;
    optionSelected?: string;
    optionPending?: string;
    optionLabel?: string;
    recents?: string;
    category?: string;
    categoryActive?: string;
    preview?: string;
    confirmButton?: string;
    dialogContent?: string;
    dialogHeader?: string;
    sheetContent?: string;
    error?: string;
}

export interface LucideIconPickerHandle {
    open: () => void;
    close: () => void;
    clearSearch: () => void;
    focus: () => void;
}

export type LucideIconPickerProps = {
    name?: string;
    id?: string;
    /** Alias for `classNames.wrapper`. */
    className?: string;
    classNames?: LucideIconPickerClassNames;
    defaultValue?: string | null;
    value?: string;
    onChange?: (icon: string) => void;
    label?: string;
    description?: string;
    defaultIcon?: string;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    placeholder?: string;
    allowedIcons?: string[];
    showSparkles?: boolean;
    /**
     * Presentation shell.
     * @default 'collapsible'
     */
    mode?: LucideIconPickerMode;
    /**
     * Trigger footprint.
     * @default 'field'
     */
    triggerVariant?: LucideIconPickerTriggerVariant;
    /**
     * Grid density.
     * @default 'comfortable'
     */
    density?: LucideIconPickerDensity;
    /**
     * Close the panel after selecting (collapsible) or after confirm (modal).
     * @default false for collapsible; modals close after confirm regardless.
     */
    closeOnSelect?: boolean;
    /**
     * Clear the search query after selecting an icon.
     * @default false
     */
    clearSearchOnSelect?: boolean;
    /**
     * Require Confirm in dialog/sheet before committing.
     * @default true when mode is dialog or sheet; false for collapsible
     */
    confirmSelection?: boolean;
    /** Show recent icons strip. @default true */
    showRecents?: boolean;
    /** Show category filter chips. @default true */
    showCategories?: boolean;
    dialogTitle?: string;
    dialogDescription?: string;
};

export type CatalogIconOption = {
    key: string;
    label: string;
    searchText: string;
    categories: readonly string[];
};
