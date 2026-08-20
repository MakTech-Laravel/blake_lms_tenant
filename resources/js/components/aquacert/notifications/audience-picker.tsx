import { useHttp } from '@inertiajs/react';
import { Check, Loader2, Search, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    NotificationAudienceOption,
    SelectOption,
} from '@/types/admin';

export type AudienceValue = {
    audience_type: string;
    /** Ids for the chosen mode. Empty for the self-contained modes. */
    ids: string[];
};

type AudiencePickerProps = {
    options: NotificationAudienceOption[];
    value: AudienceValue;
    onChange: (value: AudienceValue) => void;
    /** Pre-loaded lists, so the common modes need no round trip. */
    organizationOptions: SelectOption[];
    planOptions: SelectOption[];
    roleOptions: SelectOption[];
    /** Endpoint that searches for options, used for people. */
    optionsUrl: string;
    /** Endpoint that counts the current selection's reach. */
    estimateUrl: string;
    error?: string;
    idsError?: string;
};

/**
 * Chooses who an announcement goes to, and says how many people that is.
 *
 * The reach is deliberately server-computed rather than guessed on the client:
 * disabled accounts are excluded, role targeting resolves through a pivot, and
 * "organizations on a plan" needs the subscriptions table. Nothing here could
 * arrive at the right number on its own, and a wrong number under a Send Now
 * button is worse than no number.
 *
 * Switching mode clears the selection, because ids only mean anything within the
 * mode that produced them: organization 4 and role 4 are unrelated records.
 */
export function AudiencePicker({
    options,
    value,
    onChange,
    organizationOptions,
    planOptions,
    roleOptions,
    optionsUrl,
    estimateUrl,
    error,
    idsError,
}: AudiencePickerProps) {
    const [search, setSearch] = useState('');
    const [people, setPeople] = useState<SelectOption[]>([]);
    // Labels looked up by id, for ids that arrived without one — the case when
    // editing a draft that targets named people, since people are searched
    // rather than listed and an unsearched name has no label to render.
    const [resolved, setResolved] = useState<SelectOption[]>([]);
    // Tagged with the selection it was counted for, so a stale figure is never
    // shown against a selection that has since changed. A null count means the
    // request was answered but failed, which is not the same as still waiting.
    const [counted, setCounted] = useState<{
        key: string;
        count: number | null;
    } | null>(null);

    const selected = useMemo(
        () => options.find((option) => option.value === value.audience_type),
        [options, value.audience_type],
    );

    const resource = selected?.resource ?? null;
    const [lastResource, setLastResource] = useState(resource);

    // Ids are namespaced by resource — organization 4 and role 4 are unrelated
    // records — so every label cached here belongs to one mode only. Carrying
    // them across a mode change would let a role's name be used to caption a
    // person, and its option row appear in the people list. The search box is
    // cleared for the same reason: the term was aimed at a different list.
    if (lastResource !== resource) {
        setLastResource(resource);
        setPeople([]);
        setResolved([]);
        setSearch('');
    }

    const preloaded = useMemo<SelectOption[]>(() => {
        if (resource === 'organizations') {
            return organizationOptions;
        }

        if (resource === 'plans') {
            return planOptions;
        }

        if (resource === 'roles') {
            return roleOptions;
        }

        return [];
    }, [resource, organizationOptions, planOptions, roleOptions]);

    // Query strings rather than the hooks' own data bags: both requests fire from
    // an effect straight after the value that drives them changed, and reading
    // that value back out of React state would lag a render behind.
    const lookup = useHttp<Record<string, never>, { options: SelectOption[] }>(
        {},
    );
    const byId = useHttp<Record<string, never>, { options: SelectOption[] }>({});
    const estimate = useHttp<Record<string, never>, { count: number }>({});

    /** Identifies one exact selection, for matching a count against it. */
    const selectionKey = `${value.audience_type}:${value.ids.join(',')}`;

    /** People are searched rather than listed; everything else ships with the page. */
    useEffect(() => {
        if (resource !== 'users') {
            return;
        }

        const timeout = setTimeout(() => {
            const query = new URLSearchParams({ resource, q: search });

            lookup
                .get(`${optionsUrl}?${query.toString()}`, {
                    onSuccess: (response) => setPeople(response.options ?? []),
                })
                .catch(() => setPeople([]));
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the http helper is stable
    }, [resource, search, optionsUrl]);

    // Ids the visible lists cannot name. Kept as a string so the effect below
    // re-runs on a change of contents rather than of array identity, and settles
    // once the names arrive: resolved ids drop out of this set.
    const unnamedIds = useMemo(() => {
        if (!resource) {
            return '';
        }

        const named = new Set([
            ...preloaded.map((option) => option.value),
            ...people.map((option) => option.value),
            ...resolved.map((option) => option.value),
        ]);

        return value.ids.filter((id) => !named.has(id)).join(',');
    }, [resource, preloaded, people, resolved, value.ids]);

    useEffect(() => {
        if (!resource || unnamedIds === '') {
            return;
        }

        const query = new URLSearchParams({ resource });

        unnamedIds.split(',').forEach((id) => query.append('ids[]', id));

        byId.get(`${optionsUrl}?${query.toString()}`, {
            onSuccess: (response) =>
                setResolved((current) => {
                    // Large selections resolve in batches, and a batch can
                    // overlap one already held. Duplicates here would become
                    // duplicate React keys in the option list.
                    const held = new Set(current.map((option) => option.value));

                    return [
                        ...current,
                        ...(response.options ?? []).filter(
                            (option) => !held.has(option.value),
                        ),
                    ];
                }),
        }).catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the http helper is stable
    }, [resource, unnamedIds, optionsUrl]);

    /** Recount whenever the mode or the selection changes. */
    useEffect(() => {
        if (!value.audience_type) {
            return;
        }

        const timeout = setTimeout(() => {
            const query = new URLSearchParams({
                audience_type: value.audience_type,
            });

            value.ids.forEach((id) => query.append('ids[]', id));

            estimate
                .get(`${estimateUrl}?${query.toString()}`, {
                    onSuccess: (response) =>
                        setCounted({
                            key: selectionKey,
                            count: response.count ?? 0,
                        }),
                })
                .catch(() =>
                    // Recorded against this selection so the reader is told the
                    // count is unavailable rather than left watching a message
                    // that says it is still being worked out.
                    setCounted({ key: selectionKey, count: null }),
                );
        }, 250);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the http helper is stable
    }, [selectionKey, estimateUrl]);

    const answered = counted?.key === selectionKey;
    const reach = answered ? counted.count : null;

    // Search results only apply to the mode that produced them; a leftover list
    // from the people picker must not surface under "Selected Organizations".
    const searchResults = useMemo(
        () => (resource === 'users' ? people : []),
        [resource, people],
    );

    /**
     * The pool a chip label can come from. Chosen ids routinely fall outside the
     * visible list, so all three sources are consulted.
     */
    const pool = useMemo(
        () => [...preloaded, ...searchResults, ...resolved],
        [preloaded, searchResults, resolved],
    );

    const available = useMemo(() => {
        if (resource !== 'users') {
            return preloaded;
        }

        // Already-chosen people stay visible even while a search is narrowing the
        // list, so deselecting one never requires finding it again first.
        const chosen = resolved.filter(
            (option) =>
                value.ids.includes(option.value) &&
                !searchResults.some((result) => result.value === option.value),
        );

        return [...chosen, ...searchResults];
    }, [resource, preloaded, resolved, searchResults, value.ids]);

    const chips = useMemo(
        () =>
            value.ids.map((id) => ({
                value: id,
                label:
                    pool.find((option) => option.value === id)?.label ?? `#${id}`,
            })),
        [value.ids, pool],
    );

    const toggleId = (id: string) => {
        onChange({
            ...value,
            ids: value.ids.includes(id)
                ? value.ids.filter((current) => current !== id)
                : [...value.ids, id],
        });
    };

    return (
        <div className="grid gap-3">
            <div className="grid gap-1.5">
                <Label htmlFor="announcement-audience">Audience</Label>
                <Select
                    value={value.audience_type}
                    onValueChange={(next) =>
                        onChange({ audience_type: next, ids: [] })
                    }
                >
                    <SelectTrigger
                        id="announcement-audience"
                        className="w-full border-navy-100 focus-visible:border-aqua-400 focus-visible:ring-aqua-200/50"
                    >
                        <SelectValue placeholder="Choose an audience" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error ? (
                    <p className="text-body-4 text-red-600">{error}</p>
                ) : (
                    selected && (
                        <p className="text-body-4 text-navy-300">
                            {selected.description}
                        </p>
                    )
                )}
            </div>

            {resource && (
                <div className="grid gap-2 rounded-xl border border-navy-100 bg-navy-50/30 p-3">
                    {resource === 'users' && (
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search people by name or email..."
                                className="border-navy-100 bg-white pl-9"
                            />
                            {lookup.processing && (
                                <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-navy-200" />
                            )}
                        </div>
                    )}

                    {chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {chips.map((chip) => (
                                <span
                                    key={chip.value}
                                    className="flex items-center gap-1 rounded-full border border-aqua-200 bg-aqua-50 py-0.5 pr-1 pl-2.5 text-caption-1 font-medium text-aqua-700"
                                >
                                    {chip.label}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${chip.label}`}
                                        onClick={() => toggleId(chip.value)}
                                        className="rounded-full p-0.5 text-aqua-600 transition-colors hover:bg-aqua-200/70"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="max-h-44 overflow-y-auto rounded-lg border border-navy-100 bg-white">
                        {available.length === 0 ? (
                            <p className="px-3 py-6 text-center text-body-4 text-navy-300">
                                {resource === 'users'
                                    ? 'Search for someone to add them.'
                                    : 'Nothing available to choose from.'}
                            </p>
                        ) : (
                            <ul>
                                {available.map((option) => {
                                    const isSelected = value.ids.includes(
                                        option.value,
                                    );

                                    return (
                                        <li key={option.value}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleId(option.value)
                                                }
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-2 border-b border-navy-50 px-3 py-2 text-left text-body-4 last:border-b-0 transition-colors',
                                                    isSelected
                                                        ? 'bg-aqua-50/60 font-medium text-navy-500'
                                                        : 'text-navy-400 hover:bg-navy-50/60',
                                                )}
                                            >
                                                <span className="truncate">
                                                    {option.label}
                                                </span>
                                                {isSelected && (
                                                    <Check className="size-4 shrink-0 text-aqua-600" />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {idsError && (
                        <p className="text-body-4 text-red-600">{idsError}</p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-aqua-50/60 px-3 py-2">
                <Users className="size-4 shrink-0 text-aqua-600" />
                <p className="text-body-4 text-navy-400">
                    {!answered || estimate.processing ? (
                        'Working out who this reaches...'
                    ) : reach === null ? (
                        <span className="font-medium text-amber-700">
                            Could not work out who this reaches. It will still be
                            sent to the audience above.
                        </span>
                    ) : reach === 0 ? (
                        <span className="font-medium text-amber-700">
                            This currently reaches nobody.
                        </span>
                    ) : (
                        <>
                            Reaches{' '}
                            <Badge
                                variant="outline"
                                className="border-aqua-200 bg-white px-1.5 py-0 text-caption-1 font-semibold text-aqua-700 tabular-nums"
                            >
                                {reach}
                            </Badge>{' '}
                            {reach === 1 ? 'person' : 'people'}. Disabled
                            accounts are excluded.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
