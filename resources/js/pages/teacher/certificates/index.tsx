import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { StatusBadge } from '@/components/aquacert/status-badge';
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
};

type Props = {
    certificates?: CertificateRow[];
};

export default function TeacherCertificatesPage({ certificates }: Props) {
    const rows =
        certificates && certificates.length > 0
            ? certificates.map((certificate) => ({
                  id: certificate.id,
                  title:
                      certificate.course_title ??
                      certificate.title ??
                      'Certificate',
                  issued: certificate.issued_at ?? certificate.issued ?? '—',
                  expires: certificate.expires ?? '—',
                  status: certificate.status ?? 'Valid',
              }))
            : learnerOverview.certificates;

    return (
        <>
            <Head title="Certificates" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-[#f8fafc] p-4 md:p-6">
                <AquaPageHeader
                    title="Certificates"
                    subtitle="Your earned and available certificates"
                />
                <div className="grid gap-4 md:grid-cols-2">
                    {rows.map((certificate) => (
                        <Card
                            key={certificate.id}
                            className="border-navy-50 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-h6 font-semibold text-navy-500">
                                        {certificate.title}
                                    </h3>
                                    <p className="mt-2 text-body-4 text-navy-300">
                                        Issued {certificate.issued}
                                    </p>
                                    <p className="text-body-4 text-navy-300">
                                        Expires {certificate.expires}
                                    </p>
                                </div>
                                <StatusBadge status={certificate.status} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
