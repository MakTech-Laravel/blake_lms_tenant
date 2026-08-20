import { Head } from '@inertiajs/react';
import { Download, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { CertificatePreview } from '@/components/aquacert/certificate-preview';
import { ModuleDetailSheet } from '@/components/aquacert/module-detail-sheet';
import { ModuleEmptyState } from '@/components/aquacert/module-empty-state';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { learnerOverview } from '@/data/aquacert-fixtures';

type CertificateRow = {
    id: number | string;
    certificate_number?: string;
    course_title?: string;
    title?: string;
    issued_at?: string;
    issued?: string;
    expires?: string;
    status?: string;
    has_pdf?: boolean;
    has_preview?: boolean;
};

type Props = {
    certificates?: CertificateRow[];
};

export default function TeacherCertificatesPage({ certificates }: Props) {
    const live = Boolean(certificates && certificates.length > 0);
    const rows = live
        ? (certificates ?? []).map((certificate) => ({
              id: certificate.id,
              title:
                  certificate.course_title ??
                  certificate.title ??
                  'Certificate',
              number: certificate.certificate_number ?? String(certificate.id),
              issued: certificate.issued_at ?? certificate.issued ?? '—',
              expires: certificate.expires ?? '—',
              status: certificate.status ?? 'Valid',
          }))
        : learnerOverview.certificates.map((certificate) => ({
              id: certificate.id,
              title: certificate.title,
              number: `AC-${certificate.id}`,
              issued: certificate.issued,
              expires: certificate.expires,
              status: certificate.status,
          }));

    const [selected, setSelected] = useState<(typeof rows)[number] | null>(
        null,
    );

    return (
        <>
            <Head title="Certificates" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Certificates"
                    subtitle="Your earned and available certificates"
                />

                {rows.length === 0 ? (
                    <ModuleEmptyState
                        title="No certificates yet"
                        description="Complete a course to earn your first AquaCert certificate."
                    />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {rows.map((certificate) => (
                            <Card
                                key={certificate.id}
                                className="border-navy-50 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <button
                                        type="button"
                                        className="text-left"
                                        onClick={() => setSelected(certificate)}
                                    >
                                        <h3 className="text-h6 font-semibold text-navy-500">
                                            {certificate.title}
                                        </h3>
                                        <p className="mt-2 text-body-4 text-navy-300">
                                            Issued {certificate.issued}
                                        </p>
                                        <p className="text-body-4 text-navy-300">
                                            Expires {certificate.expires}
                                        </p>
                                    </button>
                                    <StatusBadge status={certificate.status} />
                                </div>
                                {live && (
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            asChild
                                            size="sm"
                                            className="bg-navy-500 text-white hover:bg-navy-600"
                                        >
                                            <a
                                                href={`/dashboard/certificates/${certificate.id}/download`}
                                            >
                                                <Download className="size-4" />
                                                PDF
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <a
                                                href={`/dashboard/certificates/${certificate.id}/preview`}
                                            >
                                                <ImageIcon className="size-4" />
                                                PNG
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <ModuleDetailSheet
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelected(null);
                    }
                }}
                title={selected?.title ?? 'Certificate'}
                description={selected?.number}
            >
                {selected && (
                    <CertificatePreview
                        recipientName="You"
                        courseTitle={selected.title}
                        certificateNumber={selected.number}
                        issuedAt={selected.issued}
                        expiresAt={selected.expires}
                    />
                )}
            </ModuleDetailSheet>
        </>
    );
}
