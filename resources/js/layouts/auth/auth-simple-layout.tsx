import { Link } from '@inertiajs/react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-b from-navy-50 via-white to-white p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-2xl border border-navy-50 bg-white p-8 shadow-sm">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <AquaCertLogo className="text-h5" />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-h6 font-bold text-navy-500">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-center text-body-2 text-aqua-600">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
