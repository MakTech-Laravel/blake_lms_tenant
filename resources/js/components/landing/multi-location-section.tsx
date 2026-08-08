import { multiLocation } from '@/data/landing';

export function MultiLocationSection() {
    return (
        <section className="bg-navy-500 py-20 text-white sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-h4 font-bold sm:text-h3">
                        {multiLocation.title}
                    </h2>
                    <p className="mt-4 text-body-2 text-navy-100">
                        {multiLocation.description}
                    </p>
                </div>

                <div className="mx-auto mt-14 max-w-3xl">
                    <div className="rounded-xl border border-white/10 bg-navy-400/40 px-6 py-4 text-center text-label-1 font-semibold">
                        {multiLocation.hq}
                    </div>
                    <div className="mx-auto h-8 w-px bg-aqua-400/60" />
                    <div className="grid gap-4 sm:grid-cols-3">
                        {multiLocation.sites.map((site) => (
                            <div
                                key={site}
                                className="rounded-xl border border-aqua-400/30 bg-navy-600/80 px-4 py-5 text-center text-label-2 font-medium"
                            >
                                {site}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
