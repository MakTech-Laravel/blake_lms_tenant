import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

interface SortableTableHeadProps {
    /** Matches the controller's whitelisted `sort` key. */
    column: string;
    label: string;
    /** The column the list is currently ordered by. */
    activeColumn: string;
    activeDirection: SortDirection;
    onSort: (column: string, direction: SortDirection) => void;
    className?: string;
}

/**
 * A table header that toggles server-side ordering. Clicking the active column
 * flips the direction; clicking any other column starts it ascending.
 */
export function SortableTableHead({
    column,
    label,
    activeColumn,
    activeDirection,
    onSort,
    className,
}: SortableTableHeadProps) {
    const isActive = activeColumn === column;
    const nextDirection: SortDirection =
        isActive && activeDirection === 'asc' ? 'desc' : 'asc';

    const Icon = !isActive
        ? ChevronsUpDown
        : activeDirection === 'asc'
          ? ChevronUp
          : ChevronDown;

    return (
        <TableHead
            aria-sort={
                isActive
                    ? activeDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                    : 'none'
            }
            className={cn(
                'text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase',
                className,
            )}
        >
            <button
                type="button"
                onClick={() => onSort(column, nextDirection)}
                className="group flex items-center gap-1 rounded-sm text-caption-1 font-semibold tracking-wide uppercase transition-colors hover:text-aqua-800 focus-visible:ring-2 focus-visible:ring-aqua-300 focus-visible:outline-none"
            >
                {label}
                <Icon
                    className={cn(
                        'size-3.5 transition-opacity',
                        isActive
                            ? 'opacity-100'
                            : 'opacity-40 group-hover:opacity-70',
                    )}
                />
            </button>
        </TableHead>
    );
}
