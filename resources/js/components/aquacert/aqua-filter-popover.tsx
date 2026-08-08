import { Filter, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AquaFilterOption = {
    value: string;
    label: string;
};

export type AquaFilterField = {
    key: string;
    label: string;
    /** Label used for the "no filter" choice and as the trigger placeholder. */
    anyLabel: string;
    options: AquaFilterOption[];
};

export type AquaFilterValues = Record<string, string>;

/** Radix selects reject empty string values, so the "any" choice needs a sentinel. */
const ANY_VALUE = '__any__';

function countActive(fields: AquaFilterField[], values: AquaFilterValues): number {
    return fields.filter((field) => values[field.key]).length;
}

function emptyValues(fields: AquaFilterField[]): AquaFilterValues {
    return Object.fromEntries(fields.map((field) => [field.key, '']));
}

interface AquaFilterPopoverProps {
    fields: AquaFilterField[];
    values: AquaFilterValues;
    onApply: (values: AquaFilterValues) => void;
    description?: string;
    align?: 'start' | 'center' | 'end';
}

/**
 * Filter popover shared by AquaCert listing pages. Selections are staged in a
 * draft and only committed when "Apply" is pressed.
 */
export function AquaFilterPopover({
    fields,
    values,
    onApply,
    description,
    align = 'end',
}: AquaFilterPopoverProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<AquaFilterValues>(values);

    useEffect(() => {
        setDraft(values);
    }, [values]);

    const activeCount = countActive(fields, values);
    const draftCount = countActive(fields, draft);

    const handleOpenChange = (next: boolean) => {
        if (next) {
            setDraft(values);
        }

        setOpen(next);
    };

    const apply = () => {
        onApply(draft);
        setOpen(false);
    };

    const clearAll = () => {
        const empty = emptyValues(fields);
        setDraft(empty);
        onApply(empty);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="border-navy-100 text-navy-400 data-[state=open]:border-aqua-300 data-[state=open]:bg-aqua-50/60 data-[state=open]:text-navy-500"
                >
                    <Filter className="size-4" />
                    Filters
                    {activeCount > 0 && (
                        <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-aqua-500 text-caption-1 font-semibold text-white tabular-nums">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align={align}
                sideOffset={8}
                className="w-78 overflow-hidden rounded-xl border-navy-100 p-0 shadow-lg"
            >
                <div className="flex items-start justify-between gap-3 border-b border-navy-50 px-4 py-3">
                    <div>
                        <p className="text-body-3 font-semibold text-navy-500">
                            Filters
                        </p>
                        {description && (
                            <p className="mt-0.5 text-caption-1 leading-snug text-navy-300">
                                {description}
                            </p>
                        )}
                    </div>
                    {draftCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setDraft(emptyValues(fields))}
                            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-caption-1 font-medium text-navy-300 transition-colors hover:bg-navy-50 hover:text-navy-500"
                        >
                            <RotateCcw className="size-3" />
                            Reset
                        </button>
                    )}
                </div>

                <div className="space-y-3 px-4 py-4">
                    {fields.map((field) => (
                        <div key={field.key} className="grid gap-1.5">
                            <Label className="text-caption-1 font-semibold tracking-wide text-navy-400 uppercase">
                                {field.label}
                            </Label>
                            <Select
                                value={draft[field.key] || ANY_VALUE}
                                onValueChange={(value) =>
                                    setDraft((current) => ({
                                        ...current,
                                        [field.key]:
                                            value === ANY_VALUE ? '' : value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full border-navy-100 bg-white text-body-3 text-navy-500 focus-visible:border-aqua-400 focus-visible:ring-aqua-200/50">
                                    <SelectValue placeholder={field.anyLabel} />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                    <SelectItem value={ANY_VALUE}>
                                        {field.anyLabel}
                                    </SelectItem>
                                    {field.options.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-navy-50 bg-navy-50/40 px-4 py-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={activeCount === 0 && draftCount === 0}
                        onClick={clearAll}
                        className="text-navy-400 hover:bg-white hover:text-navy-500 disabled:opacity-40"
                    >
                        Clear all
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={apply}
                        className="bg-navy-500 text-white hover:bg-navy-600"
                    >
                        Apply filters
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

interface AquaFilterChipsProps {
    fields: AquaFilterField[];
    values: AquaFilterValues;
    onChange: (values: AquaFilterValues) => void;
    className?: string;
}

/** Removable summary of the filters currently applied to a listing. */
export function AquaFilterChips({
    fields,
    values,
    onChange,
    className,
}: AquaFilterChipsProps) {
    const active = fields
        .map((field) => {
            const value = values[field.key];

            if (!value) {
                return null;
            }

            const option = field.options.find((item) => item.value === value);

            return {
                field,
                label: `${field.label}: ${option?.label ?? value}`,
            };
        })
        .filter((chip): chip is { field: AquaFilterField; label: string } =>
            Boolean(chip),
        );

    if (active.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {active.map(({ field, label }) => (
                <span
                    key={field.key}
                    className="flex items-center gap-1.5 rounded-full border border-aqua-200 bg-aqua-50 py-1 pr-1.5 pl-2.5 text-caption-1 font-medium text-aqua-700"
                >
                    {label}
                    <button
                        type="button"
                        aria-label={`Remove ${field.label} filter`}
                        onClick={() =>
                            onChange({ ...values, [field.key]: '' })
                        }
                        className="rounded-full p-0.5 text-aqua-600 transition-colors hover:bg-aqua-200/70 hover:text-aqua-800"
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            {active.length > 1 && (
                <button
                    type="button"
                    onClick={() => onChange(emptyValues(fields))}
                    className="rounded-md px-1.5 py-1 text-caption-1 font-medium text-navy-300 transition-colors hover:text-navy-500"
                >
                    Clear all
                </button>
            )}
        </div>
    );
}
