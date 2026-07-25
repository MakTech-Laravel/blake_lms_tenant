import {
    useCallback,
    useDeferredValue,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    pushRecentIcon,
    readRecentIcons,
} from '@/components/icons/icon-picker-recents';
import type {
    CatalogIconOption,
    LucideIconPickerMode,
    LucideIconPickerProps,
} from '@/components/icons/lucide-icon-picker-types';
import {
    getIconLabel,
    isValidLucideIconKey,
    resolveIconKey,
} from '@/lib/icons';
import { prefetchLucideIcons } from '@/lib/lucide-icon-cache';

type UseIconPickerStateOptions = Pick<
    LucideIconPickerProps,
    | 'id'
    | 'defaultValue'
    | 'value'
    | 'onChange'
    | 'defaultIcon'
    | 'defaultOpen'
    | 'open'
    | 'onOpenChange'
    | 'disabled'
    | 'placeholder'
    | 'allowedIcons'
    | 'closeOnSelect'
    | 'clearSearchOnSelect'
    | 'confirmSelection'
    | 'showRecents'
    | 'mode'
> & {
    mode: LucideIconPickerMode;
};

export function useIconPickerState({
    id,
    defaultValue,
    value,
    onChange,
    defaultIcon = 'pen-line',
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    disabled = false,
    placeholder,
    allowedIcons,
    closeOnSelect = false,
    clearSearchOnSelect = false,
    confirmSelection: confirmSelectionProp,
    showRecents = true,
    mode,
}: UseIconPickerStateOptions) {
    const reactId = useId();
    const searchId = id ? `${id}-search` : `${reactId}-search`;
    const gridId = id ? `${id}-grid` : `${reactId}-grid`;
    const statusId = id ? `${id}-status` : `${reactId}-status`;
    const triggerRef = useRef<HTMLButtonElement>(null);

    const confirmSelection =
        confirmSelectionProp ?? (mode === 'dialog' || mode === 'sheet');

    const isControlledValue = value !== undefined;
    const isControlledOpen = openProp !== undefined;

    const [selected, setSelected] = useState(() =>
        resolveIconKey(
            isControlledValue ? value : (defaultValue ?? defaultIcon),
        ),
    );
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [category, setCategory] = useState<string | null>(null);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [catalog, setCatalog] = useState<readonly CatalogIconOption[] | null>(
        null,
    );
    const [categories, setCategories] = useState<readonly string[]>([]);
    const [recents, setRecents] = useState<string[]>([]);
    const [pendingIcon, setPendingIcon] = useState<string | null>(null);

    const open = isControlledOpen ? openProp : uncontrolledOpen;

    const displayIcon = isControlledValue
        ? resolveIconKey(value)
        : selected;

    const setOpen = useCallback(
        (nextOpen: boolean) => {
            if (disabled) {
                return;
            }

            if (!isControlledOpen) {
                setUncontrolledOpen(nextOpen);
            }

            onOpenChange?.(nextOpen);

            if (!nextOpen) {
                setQuery('');
                setCategory(null);
                setPendingIcon(null);
            } else {
                if (showRecents) {
                    setRecents(readRecentIcons());
                }

                if (confirmSelection) {
                    setPendingIcon(displayIcon);
                }
            }
        },
        [
            confirmSelection,
            disabled,
            displayIcon,
            isControlledOpen,
            onOpenChange,
            showRecents,
        ],
    );

    const catalogLoading = open && catalog === null;

    useEffect(() => {
        void prefetchLucideIcons([displayIcon]);
    }, [displayIcon]);

    useEffect(() => {
        if (!open || catalog) {
            return;
        }

        let cancelled = false;

        void import('@/lib/icon-catalog')
            .then((module) => {
                if (!cancelled) {
                    setCatalog(
                        module.ICON_OPTIONS as readonly CatalogIconOption[],
                    );
                    setCategories(module.ICON_CATEGORIES as readonly string[]);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalog([]);
                    setCategories([]);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [catalog, open]);

    const allowedSet = useMemo(() => {
        if (!allowedIcons || allowedIcons.length === 0) {
            return null;
        }

        return new Set(allowedIcons);
    }, [allowedIcons]);

    const baseOptions = useMemo(() => {
        if (!catalog) {
            return [] as CatalogIconOption[];
        }

        if (!allowedSet) {
            return [...catalog];
        }

        return catalog.filter((option) => allowedSet.has(option.key));
    }, [allowedSet, catalog]);

    const categoryOptions = useMemo(() => {
        if (!category) {
            return baseOptions;
        }

        return baseOptions.filter((option) =>
            option.categories.includes(category),
        );
    }, [baseOptions, category]);

    const filteredOptions = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        if (normalizedQuery === '') {
            return categoryOptions;
        }

        return categoryOptions.filter((option) =>
            option.searchText.includes(normalizedQuery),
        );
    }, [categoryOptions, deferredQuery]);

    const availableCategories = useMemo(() => {
        if (categories.length === 0) {
            return [] as string[];
        }

        const present = new Set<string>();

        for (const option of baseOptions) {
            for (const item of option.categories) {
                present.add(item);
            }
        }

        return categories.filter((item) => present.has(item));
    }, [baseOptions, categories]);

    const recentOptions = useMemo(() => {
        if (!showRecents || recents.length === 0) {
            return [] as CatalogIconOption[];
        }

        const byKey = new Map(baseOptions.map((option) => [option.key, option]));

        return recents
            .map((key) => byKey.get(key))
            .filter((option): option is CatalogIconOption => Boolean(option));
    }, [baseOptions, recents, showRecents]);

    const isSearchPending = query !== deferredQuery;

    const activeIcon = confirmSelection
        ? (pendingIcon ?? displayIcon)
        : displayIcon;

    const displayLabel = useMemo(() => {
        const fromCatalog = catalog?.find(
            (option) => option.key === displayIcon,
        )?.label;

        return fromCatalog ?? getIconLabel(displayIcon);
    }, [catalog, displayIcon]);

    const activeLabel = useMemo(() => {
        const fromCatalog = catalog?.find(
            (option) => option.key === activeIcon,
        )?.label;

        return fromCatalog ?? getIconLabel(activeIcon);
    }, [activeIcon, catalog]);

    const commitIcon = useCallback(
        (key: string, options?: { close?: boolean }) => {
            if (disabled) {
                return;
            }

            if (!isControlledValue) {
                setSelected(key);
            }

            onChange?.(key);

            if (showRecents) {
                setRecents(pushRecentIcon(key));
            }

            if (clearSearchOnSelect) {
                setQuery('');
            }

            const shouldClose = options?.close ?? closeOnSelect;

            if (shouldClose) {
                setOpen(false);
                triggerRef.current?.focus();
            }
        },
        [
            clearSearchOnSelect,
            closeOnSelect,
            disabled,
            isControlledValue,
            onChange,
            setOpen,
            showRecents,
        ],
    );

    const selectIcon = useCallback(
        (key: string) => {
            if (disabled) {
                return;
            }

            if (confirmSelection) {
                setPendingIcon(key);

                return;
            }

            commitIcon(key);
        },
        [commitIcon, confirmSelection, disabled],
    );

    const confirmPending = useCallback(() => {
        const key = pendingIcon ?? displayIcon;
        commitIcon(key, { close: true });
    }, [commitIcon, displayIcon, pendingIcon]);

    const hadInvalidDefault =
        defaultValue != null &&
        defaultValue !== '' &&
        !isValidLucideIconKey(defaultValue);

    const statusMessage = catalogLoading
        ? 'Loading icons…'
        : filteredOptions.length === 0
          ? 'No icons match your filters.'
          : `${filteredOptions.length.toLocaleString()} icons`;

    const searchPlaceholder =
        placeholder ??
        (catalog
            ? `Search ${baseOptions.length.toLocaleString()} icons…`
            : 'Search icons…');

    const clearSearch = useCallback(() => {
        setQuery('');
    }, []);

    const focus = useCallback(() => {
        triggerRef.current?.focus();
    }, []);

    return {
        searchId,
        gridId,
        statusId,
        triggerRef,
        open,
        setOpen,
        query,
        setQuery,
        deferredQuery,
        category,
        setCategory,
        catalogLoading,
        filteredOptions,
        availableCategories,
        recentOptions,
        isSearchPending,
        displayIcon,
        displayLabel,
        activeIcon,
        activeLabel,
        pendingIcon,
        confirmSelection,
        selectIcon,
        confirmPending,
        hadInvalidDefault,
        statusMessage,
        searchPlaceholder,
        clearSearch,
        focus,
    };
}

export type IconPickerState = ReturnType<typeof useIconPickerState>;
