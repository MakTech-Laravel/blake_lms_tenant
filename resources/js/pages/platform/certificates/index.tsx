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
import { platformCertificates } from '@/data/modules/platform-modules';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';

type LiveCertificate = {
    id: number;
    number: string;
    holder: string;
    course: string;
    organization: string;
    issued: string;
    status: string;
};

type Template = {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
};

type Props = {
    certificates?: LiveCertificate[];
    templates?: Template[];
};

export default function PlatformCertificatesPage({
    certificates,
    templates = [],
}: Props) {
    const { can } = usePermission();
    const canIssue = can(PERMISSIONS.PLATFORM_CERTIFICATES.ISSUE);
    const canDownload = can(PERMISSIONS.PLATFORM_CERTIFICATES.DOWNLOAD);
    const canRevoke = can(PERMISSIONS.PLATFORM_CERTIFICATES.REVOKE);

    const rows =
        certificates && certificates.length > 0
            ? certificates
            : platformCertificates.rows.map((row) => ({
                  id: Number(row.id),
                  number: String(row.number),
                  holder: String(row.holder),
                  course: String(row.course),
                  organization: String(row.organization),
                  issued: String(row.issued),
                  status: String(row.status),
              }));

    const [selected, setSelected] = useState<LiveCertificate | null>(null);
    const defaultTemplate = templates.find((template) => template.is_default);

    return (
        <>
            <Head title="Certificates" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title="Certificates"
                    subtitle={
                        defaultTemplate
                            ? `Issued certificates · Template: ${defaultTemplate.name}`
                            : platformCertificates.subtitle
                    }
                    actions={
                        canIssue ? (
                            <Button className="bg-navy-500 text-white hover:bg-navy-600">
                                <Plus className="size-4" />
                                Issue Certificate
                            </Button>
                        ) : undefined
                    }
                />

                <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                    <DataTableToolbar
                        placeholder="Search certificates..."
                        exportPermission={
                            PERMISSIONS.PLATFORM_CERTIFICATES.EXPORT
                        }
                    />
                    <div className="mt-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-navy-50 hover:bg-transparent">
                                    {platformCertificates.columns.map(
                                        (column) => (
                                            <TableHead
                                                key={column.key}
                                                className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase"
                                            >
                                                {column.label}
                                            </TableHead>
                                        ),
                                    )}
                                    <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-navy-50"
                                    >
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
                                        <TableCell>
                                            {row.organization}
                                        </TableCell>
                                        <TableCell>{row.issued}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                        <TableCell>
                                            {canDownload &&
                                                (certificates &&
                                                certificates.length > 0 ? (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <a
                                                            href={`/platform/certificates/${row.id}/download`}
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
                                                        onClick={() =>
                                                            setSelected(row)
                                                        }
                                                    >
                                                        Preview
                                                    </Button>
                                                ))}
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
                footer={
                    selected && (canDownload || canRevoke) ? (
                        <div className="flex flex-wrap gap-2">
                            {canDownload &&
                                certificates &&
                                certificates.length > 0 && (
                                    <Button
                                        asChild
                                        className="bg-navy-500 text-white hover:bg-navy-600"
                                    >
                                        <a
                                            href={`/platform/certificates/${selected.id}/download`}
                                        >
                                            <Download className="size-4" />
                                            Download PDF
                                        </a>
                                    </Button>
                                )}
                            {canRevoke && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-navy-100 text-navy-400"
                                >
                                    Revoke
                                </Button>
                            )}
                        </div>
                    ) : null
                }
            >
                {selected && (
                    <CertificatePreview
                        recipientName={selected.holder}
                        courseTitle={selected.course}
                        certificateNumber={selected.number}
                        issuedAt={selected.issued}
                    />
                )}
            </ModuleDetailSheet>
        </>
    );
}
