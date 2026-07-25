import {
    useCallback,
    useDeferredValue,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';

import type {
    CatalogIconOption,
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
>;

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
}: UseIconPickerStateOptions) {
    const reactId = useId();
    const searchId = id ? `${id}-search` : `${reactId}-search`;
    const gridId = id ? `${id}-grid` : `${reactId}-grid`;
    const statusId = id ? `${id}-status` : `${reactId}-status`;
    const triggerRef = useRef<HTMLButtonElement>(null);

    const isControlledValue = value !== undefined;
    const isControlledOpen = openProp !== undefined;

    const [selected, setSelected] = useState(() =>
        resolveIconKey(
            isControlledValue ? value : (defaultValue ?? defaultIcon),
        ),
    );
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [catalog, setCatalog] = useState<readonly CatalogIconOption[] | null>(
        null,
    );

    const open = isControlledOpen ? openProp : uncontrolledOpen;

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
            }
        },
        [disabled, isControlledOpen, onOpenChange],
    );

    const catalogLoading = open && catalog === null;

    useEffect(() => {
        void prefetchLucideIcons([
            isControlledValue ? resolveIconKey(value) : selected,
        ]);
    }, [isControlledValue, selected, value]);

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
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setCatalog([]);
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

    const filteredOptions = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        if (normalizedQuery === '') {
            return baseOptions;
        }

        return baseOptions.filter((option) =>
            option.searchText.includes(normalizedQuery),
        );
    }, [baseOptions, deferredQuery]);

    const isSearchPending = query !== deferredQuery;

    const displayIcon = isControlledValue
        ? resolveIconKey(value)
        : selected;

    const displayLabel = useMemo(() => {
        const fromCatalog = catalog?.find(
            (option) => option.key === displayIcon,
        )?.label;

        return fromCatalog ?? getIconLabel(displayIcon);
    }, [catalog, displayIcon]);

    const selectIcon = useCallback(
        (key: string) => {
            if (disabled) {
                return;
            }

            if (!isControlledValue) {
                setSelected(key);
            }

            onChange?.(key);

            if (clearSearchOnSelect) {
                setQuery('');
            }

            if (closeOnSelect) {
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
        ],
    );

    const hadInvalidDefault =
        defaultValue != null &&
        defaultValue !== '' &&
        !isValidLucideIconKey(defaultValue);

    const statusMessage = catalogLoading
        ? 'Loading icons…'
        : filteredOptions.length === 0
          ? 'No icons match your search.'
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
        catalogLoading,
        filteredOptions,
        isSearchPending,
        displayIcon,
        displayLabel,
        selectIcon,
        hadInvalidDefault,
        statusMessage,
        searchPlaceholder,
        clearSearch,
        focus,
    };
}

export type IconPickerState = ReturnType<typeof useIconPickerState>;
