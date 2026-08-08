import { analytics } from '@/data/landing';

export function AnalyticsSection() {
    return (
        <section className="bg-gradient-to-b from-aqua-50/40 to-white py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                <div>
                    <h2 className="text-h4 font-bold text-navy-500 sm:text-h3">
                        {analytics.title}
                    </h2>
                    <p className="mt-4 text-body-2 text-navy-300">
                        {analytics.description}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-6">
                        {analytics.stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-h3 font-bold text-navy-500">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-label-2 text-navy-300">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-navy-50 bg-white p-6 shadow-lg">
                    <div className="flex h-40 items-end gap-2">
                        {[40, 65, 48, 80, 55, 90, 70].map((height, index) => (
                            <div
                                key={index}
                                className="flex-1 rounded-t-md bg-gradient-to-t from-navy-500 to-aqua-400"
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                            <p className="text-caption-1 font-semibold tracking-wide text-red-600 uppercase">
                                High Risk
                            </p>
                            <p className="mt-1 text-label-2 font-medium text-navy-500">
                                1 Staff
                            </p>
                        </div>
                        <div className="rounded-xl border border-aqua-100 bg-aqua-50 p-3">
                            <p className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                Quick Overview
                            </p>
                            <p className="mt-1 text-label-2 font-medium text-navy-500">
                                0 Staff
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
