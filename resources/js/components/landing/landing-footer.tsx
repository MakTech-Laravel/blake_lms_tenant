import { Linkedin, Twitter } from 'lucide-react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import { footer } from '@/data/landing';

export function LandingFooter() {
    return (
        <footer className="bg-navy-700 text-navy-100">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_auto] lg:px-8">
                <div>
                    <AquaCertLogo variant="light" className="text-h5" />
                    <p className="mt-4 max-w-sm text-body-3 text-navy-100">
                        {footer.mission}
                    </p>
                </div>

                <div>
                    <p className="text-label-2 font-semibold text-white">
                        Product
                    </p>
                    <ul className="mt-4 space-y-2">
                        {footer.product.map((item) => (
                            <li key={item}>
                                <a
                                    href={`#${item.toLowerCase()}`}
                                    className="text-body-3 text-navy-100 transition-colors hover:text-white"
                                >
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-label-2 font-semibold text-white">
                        Company
                    </p>
                    <ul className="mt-4 space-y-2">
                        {footer.company.map((item) => (
                            <li key={item}>
                                <span className="text-body-3 text-navy-100">
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-3 md:justify-end">
                    <a
                        href="#top"
                        aria-label="Twitter"
                        className="flex size-9 items-center justify-center rounded-full border border-white/15 text-aqua-300 transition-colors hover:bg-white/10"
                    >
                        <Twitter className="size-4" />
                    </a>
                    <a
                        href="#top"
                        aria-label="LinkedIn"
                        className="flex size-9 items-center justify-center rounded-full border border-white/15 text-aqua-300 transition-colors hover:bg-white/10"
                    >
                        <Linkedin className="size-4" />
                    </a>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-body-4 text-navy-200 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>{footer.copyright}</p>
                    <div className="flex flex-wrap gap-4">
                        {footer.legal.map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
