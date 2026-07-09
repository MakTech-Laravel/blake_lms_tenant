import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import Heading from '@/components/heading';

interface CertificateItem {
    id: number;
    certificate_number: string;
    course_title: string;
    issued_at: string | null;
}

interface CertificatesIndexProps {
    certificates: CertificateItem[];
}

export default function CertificatesIndex({
    certificates,
}: CertificatesIndexProps) {
    return (
        <>
            <Head title="Certificates" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Heading
                    title="Certificates"
                    description="Certificates you have earned."
                />

                {certificates.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-16 text-center">
                        <Award className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        <h3 className="mt-4 text-sm font-semibold">
                            No certificates yet
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Complete a course to earn your first certificate.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((certificate) => (
                            <div
                                key={certificate.id}
                                className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold">
                                            {certificate.course_title}
                                        </h3>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {certificate.certificate_number}
                                        </p>
                                    </div>
                                </div>
                                {certificate.issued_at && (
                                    <p className="mt-4 text-xs text-muted-foreground">
                                        Issued{' '}
                                        {new Date(
                                            certificate.issued_at,
                                        ).toLocaleDateString(undefined, {
                                            dateStyle: 'medium',
                                        })}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
