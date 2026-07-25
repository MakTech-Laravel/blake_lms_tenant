import { Check } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type { KeyboardEvent } from 'react';

import { CachedLucideIcon } from '@/components/icons/cached-lucide-icon';
import { prefetchLucideIcons } from '@/lib/lucide-icon-cache';
import { cn } from '@/lib/utils';

export type VirtualIconOption = {
    key: string;
    label: string;
};

type VirtualIconGridProps = {
    options: VirtualIconOption[];
    selected: string;
    onSelect: (key: string) => void;
    onEscape?: () => void;
    disabled?: boolean;
    id?: string;
};

const ROW_HEIGHT = 76;
const ROW_GAP = 8;
const ROW_STRIDE = ROW_HEIGHT + ROW_GAP;
const OVERSCAN_ROWS = 2;
const MIN_COLUMN_WIDTH = 72;
const MIN_COLUMNS = 4;
const MAX_COLUMNS = 8;

function columnCountForWidth(width: number): number {
    if (width <= 0) {
        return MIN_COLUMNS;
    }

    return Math.max(
        MIN_COLUMNS,
        Math.min(MAX_COLUMNS, Math.floor(width / MIN_COLUMN_WIDTH)),
    );
}

export function VirtualIconGrid({
    options,
    selected,
    onSelect,
    onEscape,
    disabled = false,
    id,
}: VirtualIconGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollRafRef = useRef<number | null>(null);
    const scrollTopRef = useRef(0);
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(384);
    const [columnCount, setColumnCount] = useState(MIN_COLUMNS);
    const [focusedIndex, setFocusedIndex] = useState(() => {
        const selectedIndex = options.findIndex(
            (option) => option.key === selected,
        );

        return selectedIndex >= 0 ? selectedIndex : 0;
    });

    useLayoutEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const updateMetrics = () => {
            setViewportHeight(element.clientHeight);
            setColumnCount(columnCountForWidth(element.clientWidth - 24));
        };

        updateMetrics();

        const observer = new ResizeObserver(updateMetrics);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const rowCount = Math.ceil(options.length / columnCount);
    const totalHeight = Math.max(0, rowCount * ROW_STRIDE - ROW_GAP);

    const { startRow, endRow } = useMemo(() => {
        const firstVisibleRow = Math.floor(scrollTop / ROW_STRIDE);
        const visibleRowCount = Math.ceil(viewportHeight / ROW_STRIDE);

        return {
            startRow: Math.max(0, firstVisibleRow - OVERSCAN_ROWS),
            endRow: Math.min(
                rowCount,
                firstVisibleRow + visibleRowCount + OVERSCAN_ROWS,
            ),
        };
    }, [rowCount, scrollTop, viewportHeight]);

    const visibleRows = useMemo(() => {
        return Array.from({ length: endRow - startRow }, (_, offset) => {
            const row = startRow + offset;
            const startIndex = row * columnCount;

            return {
                row,
                startIndex,
                items: options.slice(startIndex, startIndex + columnCount),
            };
        });
    }, [columnCount, endRow, options, startRow]);

    useEffect(() => {
        prefetchLucideIcons(
            visibleRows.flatMap(({ items }) => items.map((item) => item.key)),
        );
    }, [visibleRows]);

    const ensureIndexVisible = useCallback(
        (index: number) => {
            const element = scrollRef.current;

            if (!element || options.length === 0) {
                return;
            }

            const row = Math.floor(index / columnCount);
            const rowTop = row * ROW_STRIDE;
            const rowBottom = rowTop + ROW_HEIGHT;
            const viewTop = element.scrollTop;
            const viewBottom = viewTop + element.clientHeight;

            if (rowTop < viewTop) {
                element.scrollTop = rowTop;
            } else if (rowBottom > viewBottom) {
                element.scrollTop = rowBottom - element.clientHeight;
            }
        },
        [columnCount, options.length],
    );

    const moveFocus = useCallback(
        (nextIndex: number) => {
            if (options.length === 0) {
                return;
            }

            const clamped = Math.max(
                0,
                Math.min(options.length - 1, nextIndex),
            );
            setFocusedIndex(clamped);
            ensureIndexVisible(clamped);
        },
        [ensureIndexVisible, options.length],
    );

    const handleScroll = useCallback(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        scrollTopRef.current = element.scrollTop;

        if (scrollRafRef.current !== null) {
            return;
        }

        scrollRafRef.current = requestAnimationFrame(() => {
            scrollRafRef.current = null;

            const nextScrollTop = scrollTopRef.current;
            const previousStart = Math.max(
                0,
                Math.floor(scrollTop / ROW_STRIDE) - OVERSCAN_ROWS,
            );
            const nextStart = Math.max(
                0,
                Math.floor(nextScrollTop / ROW_STRIDE) - OVERSCAN_ROWS,
            );

            if (previousStart !== nextStart || nextScrollTop !== scrollTop) {
                setScrollTop(nextScrollTop);
            }
        });
    }, [scrollTop]);

    useEffect(() => {
        return () => {
            if (scrollRafRef.current !== null) {
                cancelAnimationFrame(scrollRafRef.current);
            }
        };
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (disabled || options.length === 0) {
                return;
            }

            const current = Math.max(
                0,
                Math.min(focusedIndex, options.length - 1),
            );

            switch (event.key) {
                case 'ArrowRight':
                    event.preventDefault();
                    moveFocus(current + 1);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    moveFocus(current - 1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveFocus(current + columnCount);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    moveFocus(current - columnCount);
                    break;
                case 'Home':
                    event.preventDefault();
                    moveFocus(0);
                    break;
                case 'End':
                    event.preventDefault();
                    moveFocus(options.length - 1);
                    break;
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    const option = options[current];

                    if (option) {
                        onSelect(option.key);
                    }

                    break;
                }
                case 'Escape':
                    event.preventDefault();
                    onEscape?.();
                    break;
                default:
                    break;
            }
        },
        [
            columnCount,
            disabled,
            focusedIndex,
            moveFocus,
            onEscape,
            onSelect,
            options,
        ],
    );

    const safeFocusedIndex =
        options.length === 0
            ? 0
            : Math.max(0, Math.min(focusedIndex, options.length - 1));

    return (
        <div
            ref={scrollRef}
            id={id}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            className="max-h-96 overflow-y-auto rounded-xl border border-border/70 bg-muted/10 p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            role="listbox"
            aria-label="Icons"
            aria-activedescendant={
                options[safeFocusedIndex]
                    ? `${id ?? 'icon-grid'}-option-${options[safeFocusedIndex].key}`
                    : undefined
            }
            aria-disabled={disabled || undefined}
        >
            <div className="relative" style={{ height: totalHeight }}>
                {visibleRows.map(({ row, startIndex, items }) => (
                    <div
                        key={row}
                        className="absolute inset-x-0 grid gap-2"
                        style={{
                            top: row * ROW_STRIDE,
                            height: ROW_HEIGHT,
                            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        }}
                    >
                        {items.map((option, offset) => {
                            const index = startIndex + offset;
                            const isSelected = selected === option.key;
                            const isFocused = index === safeFocusedIndex;

                            return (
                                <button
                                    key={option.key}
                                    id={`${id ?? 'icon-grid'}-option-${option.key}`}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    title={option.label}
                                    tabIndex={-1}
                                    disabled={disabled}
                                    onClick={() => onSelect(option.key)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors',
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 bg-background hover:border-border hover:bg-muted/40',
                                        isFocused &&
                                            'ring-2 ring-ring ring-offset-1 ring-offset-background',
                                    )}
                                >
                                    {isSelected ? (
                                        <Check
                                            className="absolute top-1 right-1 size-3"
                                            aria-hidden
                                        />
                                    ) : null}
                                    <CachedLucideIcon
                                        name={option.key}
                                        className="size-5 shrink-0"
                                    />
                                    <span className="line-clamp-2 text-[10px] leading-tight font-medium text-muted-foreground">
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
