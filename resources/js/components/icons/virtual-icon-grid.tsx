import { Check } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CachedLucideIcon } from '@/components/icons/cached-lucide-icon';
import { prefetchLucideIcons } from '@/lib/lucide-icon-cache';
import { cn } from '@/lib/utils';

type IconOption = {
    key: string;
    label: string;
};

const ROW_HEIGHT = 76;
const ROW_GAP = 8;
const ROW_STRIDE = ROW_HEIGHT + ROW_GAP;
const COLUMN_COUNT = 8;
const OVERSCAN_ROWS = 2;

export function VirtualIconGrid({
    options,
    selected,
    onSelect,
}: {
    options: IconOption[];
    selected: string;
    onSelect: (key: string) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(384);

    useLayoutEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const updateHeight = () => setViewportHeight(element.clientHeight);
        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const rowCount = Math.ceil(options.length / COLUMN_COUNT);
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
            const startIndex = row * COLUMN_COUNT;

            return {
                row,
                items: options.slice(startIndex, startIndex + COLUMN_COUNT),
            };
        });
    }, [endRow, options, startRow]);

    useEffect(() => {
        prefetchLucideIcons(
            visibleRows.flatMap(({ items }) => items.map((item) => item.key)),
        );
    }, [visibleRows]);

    const handleScroll = useCallback(() => {
        setScrollTop(scrollRef.current?.scrollTop ?? 0);
    }, []);

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-96 overflow-y-auto rounded-xl border border-border/70 bg-muted/10 p-3"
            role="listbox"
            aria-label="Icons"
        >
            <div className="relative" style={{ height: totalHeight }}>
                {visibleRows.map(({ row, items }) => (
                    <div
                        key={row}
                        className="absolute inset-x-0 grid grid-cols-8 gap-2"
                        style={{
                            top: row * ROW_STRIDE,
                            height: ROW_HEIGHT,
                        }}
                    >
                        {items.map((option) => {
                            const isSelected = selected === option.key;

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    title={option.label}
                                    onClick={() => onSelect(option.key)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors',
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 bg-background hover:border-border hover:bg-muted/40',
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
