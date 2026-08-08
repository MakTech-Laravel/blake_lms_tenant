import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pricing } from '@/data/landing';
import { cn } from '@/lib/utils';

export function PricingSection() {
    return (
        <section id="pricing" className="scroll-mt-20 bg-white py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-h4 font-bold text-navy-500 sm:text-h3">
                        {pricing.title}
                    </h2>
                    <p className="mt-4 text-body-2 text-navy-300">
                        {pricing.description}
                    </p>
                </div>

                <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
                    {pricing.plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={cn(
                                'relative flex flex-col rounded-2xl border p-8',
                                plan.popular
                                    ? 'border-navy-500 bg-navy-500 text-white shadow-xl'
                                    : 'border-navy-50 bg-white text-navy-500 shadow-sm',
                            )}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-8 rounded-full bg-emerald-500 px-3 py-1 text-caption-1 font-bold tracking-wide text-white uppercase">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="text-h6 font-semibold">
                                {plan.name}
                            </h3>
                            <p className="mt-3 text-h4 font-bold">
                                {plan.price}
                            </p>
                            <ul className="mt-6 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className={cn(
                                            'flex items-start gap-2 text-body-3',
                                            plan.popular
                                                ? 'text-navy-50'
                                                : 'text-navy-300',
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                'mt-0.5 size-4 shrink-0',
                                                plan.popular
                                                    ? 'text-aqua-300'
                                                    : 'text-aqua-600',
                                            )}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                className={cn(
                                    'mt-8 w-full',
                                    plan.popular
                                        ? 'bg-white text-navy-500 hover:bg-navy-50'
                                        : 'border border-navy-200 bg-white text-navy-500 hover:bg-navy-50',
                                )}
                                asChild
                            >
                                <a href="#demo">Contact Sales</a>
                            </Button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
