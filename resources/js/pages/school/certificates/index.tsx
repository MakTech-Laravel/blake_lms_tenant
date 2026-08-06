import { Head } from '@inertiajs/react';
import { Download, Plus } from 'lucide-react';
import { useState } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { CertificatePreview } from '@/components/aquacert/certificate-preview';
import { DataTableToolbar } from '@/components/aquacert/data-table-toolbar';
import { ModuleDetailSheet } from '@/components/aquacert/module-detail-sheet';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';
import { useTenant } from '@/hooks/use-tenant';

type LiveCertificate = {
    id: number;
    number: string;
    holder: string;
    course: string;
    issued: string;
    expires: string;
    status: string;
};

type Props = {
    certificates?: LiveCertificate[];
};

export default function SchoolCertificatesPage({ certificates }: Props) {
    const { slug } = useTenant();
    const { certificates: fixture } = useSchoolModuleVariant();
    const rows =
        certificates && certificates.length > 0
            ? certificates
            : fixture.rows.map((row) => ({
                  id: Number(row.id),
                  number: String(row.number),
                  holder: String(row.holder),
                  course: String(row.course),
                  issued: String(row.issued),
                  expires: String(row.expires),
                  status: String(row.status),
              }));

    const [selected, setSelected] = useState<LiveCertificate | null>(null);
    const live = Boolean(certificates && certificates.length > 0);

    return (
        <>
            <Head title="Certificates" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={fixture.title}
                    subtitle={fixture.subtitle}
                    actions={
                        <Button className="bg-navy-500 text-white hover:bg-navy-600">
                            <Plus className="size-4" />
                            Issue Certificate
                        </Button>
                    }
                />

                <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                    <DataTableToolbar placeholder="Search certificates..." />
                    <div className="mt-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-navy-50 hover:bg-transparent">
                                    {fixture.columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase"
                                        >
                                            {column.label}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id} className="border-navy-50">
                                        <TableCell>
                                            <button
                                                type="button"
                                                className="font-semibold text-navy-500 hover:text-aqua-600"
                                                onClick={() => setSelected(row)}
                                            >
                                                {row.number}
                                            </button>
                                        </TableCell>
                                        <TableCell>{row.holder}</TableCell>
                                        <TableCell>{row.course}</TableCell>
                                        <TableCell>{row.issued}</TableCell>
                                        <TableCell>{row.expires}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                        <TableCell>
                                            {live ? (
                                                <Button asChild size="sm" variant="outline">
                                                    <a
                                                        href={`/school/${slug}/certificates/${row.id}/download`}
                                                    >
                                                        <Download className="size-4" />
                                                        PDF
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() => setSelected(row)}
                                                >
                                                    Preview
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            <ModuleDetailSheet
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelected(null);
                    }
                }}
                title={selected?.course ?? 'Certificate'}
                description={selected?.number}
            >
                {selected && (
                    <CertificatePreview
                        recipientName={selected.holder}
                        courseTitle={selected.course}
                        certificateNumber={selected.number}
                        issuedAt={selected.issued}
                        expiresAt={selected.expires}
                    />
                )}
            </ModuleDetailSheet>
        </>
    );
}
