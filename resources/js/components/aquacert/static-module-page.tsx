import type { ReactNode } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { DataTableToolbar } from '@/components/aquacert/data-table-toolbar';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export type StaticColumn = {
    key: string;
    label: string;
    className?: string;
};

type StaticModulePageProps = {
    title: string;
    subtitle: string;
    columns: StaticColumn[];
    rows: Record<string, ReactNode>[];
    actions?: ReactNode;
    searchPlaceholder?: string;
};

export function StaticModulePage({
    title,
    subtitle,
    columns,
    rows,
    actions,
    searchPlaceholder,
}: StaticModulePageProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
            <AquaPageHeader
                title={title}
                subtitle={subtitle}
                actions={actions}
            />

            <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                <DataTableToolbar placeholder={searchPlaceholder} />
                <div className="mt-4 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-navy-50 hover:bg-transparent">
                                {columns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase"
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    className="border-navy-50"
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={column.className}
                                        >
                                            {row[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <p className="mt-4 text-body-4 text-navy-300">
                    Showing 1-{rows.length} of {rows.length}
                </p>
            </Card>
        </div>
    );
}
