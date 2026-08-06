type CertificatePreviewProps = {
    recipientName: string;
    courseTitle: string;
    certificateNumber: string;
    issuedAt: string;
    expiresAt?: string;
};

export function CertificatePreview({
    recipientName,
    courseTitle,
    certificateNumber,
    issuedAt,
    expiresAt = '—',
}: CertificatePreviewProps) {
    return (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-aqua-200 bg-gradient-to-br from-navy-500 via-navy-600 to-aqua-600 p-1 shadow-sm">
            <div className="flex h-full flex-col justify-between rounded-[10px] border border-aqua-300/40 bg-navy-500/70 p-6 text-white md:p-8">
                <div>
                    <p className="text-caption-1 font-bold tracking-[0.28em] text-aqua-200 uppercase">
                        AquaCert
                    </p>
                    <p className="mt-4 text-caption-1 tracking-[0.2em] text-navy-100 uppercase">
                        Certificate of Completion
                    </p>
                    <h3 className="mt-2 text-h5 font-bold md:text-h4">{recipientName}</h3>
                    <p className="mt-2 text-body-2 font-semibold text-aqua-200">{courseTitle}</p>
                </div>
                <div className="grid gap-3 text-body-4 text-navy-100 sm:grid-cols-3">
                    <div>
                        Certificate #
                        <p className="mt-1 font-semibold text-white">{certificateNumber}</p>
                    </div>
                    <div>
                        Issued
                        <p className="mt-1 font-semibold text-white">{issuedAt}</p>
                    </div>
                    <div>
                        Expires
                        <p className="mt-1 font-semibold text-white">{expiresAt}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
