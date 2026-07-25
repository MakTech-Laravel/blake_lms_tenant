export type LucideIconPickerMode = 'collapsible' | 'dialog';

/** Per-slot className overrides — pass only what you need. */
export interface LucideIconPickerClassNames {
    /** Root wrapper `<div>` */
    wrapper?: string;
    /** Outer shell (collapsible card / dialog trigger wrapper) */
    shell?: string;
    /** Trigger button */
    trigger?: string;
    /** Icon preview box inside the trigger */
    triggerPreview?: string;
    /** Selected icon title */
    triggerLabel?: string;
    /** Trigger subtitle / description */
    triggerDescription?: string;
    /** Right-side action label + chevron */
    triggerAction?: string;
    /** Panel body (search + grid) */
    panel?: string;
    /** Search field wrapper */
    search?: string;
    /** Search `<input>` */
    searchInput?: string;
    /** Live status / count text */
    status?: string;
    /** Catalog loading placeholder */
    loading?: string;
    /** Empty search results */
    empty?: string;
    /** Virtual grid scroll container */
    grid?: string;
    /** Individual icon option button */
    option?: string;
    /** Selected option button overrides */
    optionSelected?: string;
    /** Option label text */
    optionLabel?: string;
    /** Dialog content panel */
    dialogContent?: string;
    /** Dialog header */
    dialogHeader?: string;
    /** External error text below the picker */
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
    /** Controlled open state (collapsible or dialog). */
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
     * Close the panel/dialog after selecting an icon.
     * @default false
     */
    closeOnSelect?: boolean;
    /**
     * Clear the search query after selecting an icon.
     * @default false
     */
    clearSearchOnSelect?: boolean;
    dialogTitle?: string;
    dialogDescription?: string;
};

export type CatalogIconOption = {
    key: string;
    label: string;
    searchText: string;
};
