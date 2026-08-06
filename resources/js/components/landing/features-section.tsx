import {
    FolderKanban,
    MonitorPlay,
    Presentation,
    UserPlus,
} from 'lucide-react';
import { features } from '@/data/landing';
import { cn } from '@/lib/utils';

const icons = [UserPlus, FolderKanban, MonitorPlay, Presentation];

export function FeaturesSection() {
    return (
        <section
            id="solutions"
            className="scroll-mt-20 bg-navy-50/40 py-20 sm:py-24"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-h4 font-bold text-navy-500 sm:text-h3">
                        {features.title}
                    </h2>
                    <p className="mt-4 text-body-2 text-navy-300">
                        {features.description}
                    </p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.items.map((item, index) => {
                        const Icon = icons[index] ?? UserPlus;

                        return (
                            <article
                                key={item.title}
                                className={cn(
                                    'flex flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-1',
                                    item.featured
                                        ? 'border-navy-500 bg-navy-500 text-white shadow-lg'
                                        : 'border-navy-50 bg-white text-navy-500 shadow-sm',
                                )}
                            >
                                <div
                                    className={cn(
                                        'mb-5 flex size-11 items-center justify-center rounded-xl',
                                        item.featured
                                            ? 'bg-white/10 text-aqua-300'
                                            : 'bg-aqua-50 text-aqua-600',
                                    )}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <h3 className="text-h6 font-semibold">
                                    {item.title}
                                </h3>
                                <p
                                    className={cn(
                                        'mt-2 flex-1 text-body-3',
                                        item.featured
                                            ? 'text-navy-100'
                                            : 'text-navy-300',
                                    )}
                                >
                                    {item.description}
                                </p>
                                <a
                                    href={item.href}
                                    className={cn(
                                        'mt-5 text-label-3 font-semibold tracking-wide uppercase',
                                        item.featured
                                            ? 'text-aqua-300'
                                            : 'text-aqua-600',
                                    )}
                                >
                                    Learn more &gt;
                                </a>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
