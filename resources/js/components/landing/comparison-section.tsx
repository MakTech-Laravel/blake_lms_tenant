import { AlertTriangle, Check } from 'lucide-react';
import { comparison } from '@/data/landing';

export function ComparisonSection() {
    return (
        <section id="platform" className="scroll-mt-20 bg-white py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-h4 font-bold text-navy-500 sm:text-h3">
                        {comparison.title}
                    </h2>
                    <p className="mt-4 text-body-2 text-navy-300">
                        {comparison.description}
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-aqua-100 bg-aqua-50 p-8">
                        <h3 className="text-h6 font-semibold text-navy-500">
                            {comparison.problems.title}
                        </h3>
                        <ul className="mt-6 space-y-4">
                            {comparison.problems.items.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-body-2 text-navy-400"
                                >
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                        <AlertTriangle className="size-4" />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-navy-500 p-8 text-white shadow-lg">
                        <div className="pointer-events-none absolute -top-6 -right-6 size-24 rotate-12 rounded-xl bg-aqua-400/20" />
                        <h3 className="text-h6 font-semibold">
                            {comparison.solutions.title}
                        </h3>
                        <ul className="mt-6 space-y-4">
                            {comparison.solutions.items.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-body-2 text-navy-50"
                                >
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-aqua-500/20 text-aqua-300">
                                        <Check className="size-4" />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
