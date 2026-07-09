import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import {
    CheckIcon,
    ChevronDown,
    MinusIcon,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { groupByGroup } from '@/types/admin';
import type { PermissionOption } from '@/types/admin';

type GroupState = 'none' | 'some' | 'all';

interface PermissionSelectorProps {
    permissions: PermissionOption[];
    selected: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
}

/**
 * Group-wise permission picker.
 *
 * Each group header carries a tri-state checkbox:
 *   - checking it selects every permission in the group,
 *   - unchecking it clears the group,
 *   - it shows an indeterminate (–) state when only some items are selected.
 */
export function PermissionSelector({
    permissions,
    selected,
    onChange,
    disabled = false,
}: PermissionSelectorProps) {
    const [query, setQuery] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? permissions.filter(
                  (p) =>
                      p.name.toLowerCase().includes(q) ||
                      p.group.toLowerCase().includes(q),
              )
            : permissions;

        return Object.entries(groupByGroup(filtered));
    }, [permissions, query]);

    const allNames = useMemo(
        () => permissions.map((p) => p.name),
        [permissions],
    );

    const groupState = (names: string[]): GroupState => {
        const count = names.filter((n) => selectedSet.has(n)).length;

        if (count === 0) {
            return 'none';
        }

        if (count === names.length) {
            return 'all';
        }

        return 'some';
    };

    const toggleGroup = (names: string[]) => {
        if (disabled) {
            return;
        }

        const next = new Set(selectedSet);
        const state = groupState(names);

        if (state === 'all') {
            names.forEach((n) => next.delete(n));
        } else {
            names.forEach((n) => next.add(n));
        }

        onChange([...next]);
    };

    const toggleItem = (name: string) => {
        if (disabled) {
            return;
        }

        const next = new Set(selectedSet);

        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }

        onChange([...next]);
    };

    const setAll = (checked: boolean) => {
        if (disabled) {
            return;
        }

        onChange(checked ? [...allNames] : []);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filter permissions…"
                        className="pl-9"
                        disabled={disabled}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {selected.length} / {permissions.length} selected
                    </Badge>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setAll(true)}
                        disabled={
                            disabled || selected.length === permissions.length
                        }
                    >
                        Select all
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setAll(false)}
                        disabled={disabled || selected.length === 0}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Groups */}
            <div className="grid gap-3">
                {groups.map(([group, perms]) => {
                    const names = perms.map((p) => p.name);
                    const state = groupState(names);
                    const isCollapsed = collapsed[group] ?? false;
                    const selectedCount = names.filter((n) =>
                        selectedSet.has(n),
                    ).length;

                    return (
                        <div
                            key={group}
                            className={cn(
                                'overflow-hidden rounded-lg border bg-card transition-colors',
                                state !== 'none' && 'border-primary/30',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3 bg-muted/40 px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCollapsed((c) => ({
                                            ...c,
                                            [group]: !isCollapsed,
                                        }))
                                    }
                                    className="flex flex-1 items-center gap-2 text-left"
                                >
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform',
                                            isCollapsed && '-rotate-90',
                                        )}
                                    />
                                    <span className="text-sm font-semibold text-foreground">
                                        {group}
                                    </span>
                                    <Badge
                                        variant={
                                            state === 'all'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="ml-1 tabular-nums"
                                    >
                                        {selectedCount}/{names.length}
                                    </Badge>
                                </button>

                                {/* Group-level tri-state checkbox */}
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground select-none">
                                    Select group
                                    <TriStateCheckbox
                                        state={state}
                                        disabled={disabled}
                                        onToggle={() => toggleGroup(names)}
                                    />
                                </label>
                            </div>

                            <AnimatePresence initial={false}>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="grid grid-cols-1 gap-x-4 gap-y-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {perms.map((perm) => {
                                                const checked = selectedSet.has(
                                                    perm.name,
                                                );

                                                return (
                                                    <Label
                                                        key={perm.id}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-normal transition-colors hover:bg-muted/60',
                                                            checked &&
                                                                'bg-primary/5',
                                                            disabled &&
                                                                'cursor-not-allowed opacity-60',
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={checked}
                                                            disabled={disabled}
                                                            onCheckedChange={() =>
                                                                toggleItem(
                                                                    perm.name,
                                                                )
                                                            }
                                                        />
                                                        <span className="truncate font-mono text-xs text-foreground">
                                                            {perm.name}
                                                        </span>
                                                    </Label>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {groups.length === 0 && (
                    <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                        No permissions match “{query}”.
                    </div>
                )}
            </div>
        </div>
    );
}

function TriStateCheckbox({
    state,
    onToggle,
    disabled,
}: {
    state: GroupState;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <CheckboxPrimitive.Root
            checked={
                state === 'all'
                    ? true
                    : state === 'some'
                      ? 'indeterminate'
                      : false
            }
            onCheckedChange={onToggle}
            disabled={disabled}
            className="peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                {state === 'some' ? (
                    <MinusIcon className="size-3.5" />
                ) : (
                    <CheckIcon className="size-3.5" />
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}
