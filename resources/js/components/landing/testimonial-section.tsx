import { testimonial } from '@/data/landing';

export function TestimonialSection() {
    return (
        <section className="bg-navy-50/50 py-20 sm:py-24">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                <blockquote className="text-h5 font-medium text-balance text-navy-500 italic sm:text-h4">
                    “{testimonial.quote}”
                </blockquote>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="size-12 rounded-full object-cover"
                    />
                    <div className="text-left">
                        <p className="text-label-1 font-semibold text-navy-500">
                            {testimonial.name}
                        </p>
                        <p className="text-body-4 text-navy-300">
                            {testimonial.role}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
