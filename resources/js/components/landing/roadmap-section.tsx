import { roadmap } from '@/data/landing';

export function RoadmapSection() {
    return (
        <section className="bg-white py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <h2 className="mx-auto max-w-3xl text-center text-h4 font-bold text-navy-500 sm:text-h3">
                    {roadmap.title}
                </h2>

                <div className="relative mt-14">
                    <div className="absolute top-5 right-0 left-0 hidden h-px bg-navy-100 lg:block" />
                    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
                        {roadmap.steps.map((step, index) => (
                            <li
                                key={step.title}
                                className="relative flex flex-col items-center text-center"
                            >
                                <span className="relative z-10 flex size-10 items-center justify-center rounded-full bg-navy-500 text-label-2 font-bold text-white">
                                    {index + 1}
                                </span>
                                <h3 className="mt-4 text-label-1 font-semibold text-navy-500">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-body-4 text-navy-300">
                                    {step.description}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
