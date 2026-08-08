import { Link, usePage } from '@inertiajs/react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center bg-canvas px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-gradient-to-b from-navy-500 via-navy-600 to-navy-800 p-10 text-white lg:flex">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(10,177,185,0.28)_0%,_transparent_55%)]" />
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AquaCertLogo variant="split" className="text-h5" />
                    <span className="sr-only">{name}</span>
                </Link>
                <div className="relative z-20 max-w-md">
                    <p className="text-caption-1 font-semibold tracking-[0.18em] text-aqua-300 uppercase">
                        AquaCert LMS
                    </p>
                    <p className="mt-4 text-h5 font-bold text-balance text-white">
                        Train, track, and certify swim school teams in one place.
                    </p>
                    <p className="mt-3 text-body-3 text-navy-100">
                        Multi-location compliance, pathways, and certificates —
                        built for aquatics operators.
                    </p>
                </div>
                <p className="relative z-20 text-label-3 text-aqua-300">
                    © {new Date().getFullYear()} AquaCert
                </p>
            </div>
            <div className="w-full bg-white lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AquaCertLogo variant="dark" className="text-h5" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-h6 font-semibold text-navy-500">
                            {title}
                        </h1>
                        <p className="text-body-3 text-balance text-navy-300">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
