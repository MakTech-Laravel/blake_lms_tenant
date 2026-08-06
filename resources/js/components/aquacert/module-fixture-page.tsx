import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ModuleDetailSheet } from '@/components/aquacert/module-detail-sheet';
import { ModuleEmptyState } from '@/components/aquacert/module-empty-state';
import { StaticModulePage } from '@/components/aquacert/static-module-page';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';

export type FixtureColumn = { key: string; label: string; className?: string };
export type FixtureRow = Record<string, string | number> & { id?: string };

type ModuleFixturePageProps = {
    title: string;
    subtitle: string;
    columns: FixtureColumn[];
    rows: FixtureRow[];
    searchPlaceholder?: string;
    createLabel?: string;
    createHref?: string;
    statusKey?: string;
    detailTitle?: (row: FixtureRow) => string;
    extraActions?: ReactNode;
};

export function ModuleFixturePage({
    title,
    subtitle,
    columns,
    rows,
    searchPlaceholder,
    createLabel = 'Create',
    createHref,
    statusKey = 'status',
    detailTitle,
    extraActions,
}: ModuleFixturePageProps) {
    const [selected, setSelected] = useState<FixtureRow | null>(null);

    const createButton = createHref ? (
        <Button asChild className="bg-navy-500 text-white hover:bg-navy-600">
            <Link href={createHref}>
                <Plus className="size-4" />
                {createLabel}
            </Link>
        </Button>
    ) : (
        <Button
            type="button"
            className="bg-navy-500 text-white hover:bg-navy-600"
            onClick={() => setSelected(rows[0] ?? null)}
        >
            <Plus className="size-4" />
            {createLabel}
        </Button>
    );

    if (rows.length === 0) {
        return (
            <>
                <Head title={title} />
                <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                    <ModuleEmptyState
                        title={`No ${title.toLowerCase()} yet`}
                        description={`Create your first entry to start managing ${title.toLowerCase()}.`}
                        action={createButton}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={title} />
            <StaticModulePage
                title={title}
                subtitle={subtitle}
                searchPlaceholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
                actions={
                    <>
                        {extraActions}
                        {createButton}
                    </>
                }
                columns={columns}
                rows={rows.map((row) => {
                    const mapped: Record<string, ReactNode> = {};

                    for (const column of columns) {
                        const value = row[column.key];

                        if (column.key === statusKey && typeof value === 'string') {
                            mapped[column.key] = <StatusBadge status={value} />;
                        } else if (column.key === columns[0]?.key) {
                            mapped[column.key] = (
                                <button
                                    type="button"
                                    className="text-left font-semibold text-navy-500 hover:text-aqua-600"
                                    onClick={() => setSelected(row)}
                                >
                                    {value}
                                </button>
                            );
                        } else {
                            mapped[column.key] = value;
                        }
                    }

                    return mapped;
                })}
            />

            <ModuleDetailSheet
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelected(null);
                    }
                }}
                title={
                    selected
                        ? (detailTitle?.(selected) ?? String(selected[columns[0]?.key ?? 'id'] ?? title))
                        : title
                }
                description="Fixture detail preview — wiring comes in a later phase."
            >
                {selected &&
                    columns.map((column) => (
                        <div key={column.key} className="flex items-start justify-between gap-4 border-b border-navy-50 py-2">
                            <span className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                {column.label}
                            </span>
                            <span className="text-right text-body-3 text-navy-500">
                                {String(selected[column.key] ?? '—')}
                            </span>
                        </div>
                    ))}
            </ModuleDetailSheet>
        </>
    );
}
