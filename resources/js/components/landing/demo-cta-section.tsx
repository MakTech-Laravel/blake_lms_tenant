import { Check } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { demoCta } from '@/data/landing';

export function DemoCtaSection() {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <section id="demo" className="scroll-mt-20 bg-navy-50/40 py-20 sm:py-24">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-2xl border border-navy-50 shadow-xl md:grid md:grid-cols-2">
                    <div className="bg-navy-500 p-8 text-white sm:p-10">
                        <h2 className="text-h5 font-bold sm:text-h4">
                            {demoCta.title}
                        </h2>
                        <ul className="mt-8 space-y-4">
                            {demoCta.benefits.map((benefit) => (
                                <li
                                    key={benefit}
                                    className="flex items-start gap-3 text-body-2 text-navy-50"
                                >
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-aqua-500/20 text-aqua-300">
                                        <Check className="size-3.5" />
                                    </span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-8 sm:p-10"
                    >
                        <p className="text-h6 font-semibold text-navy-500">
                            {demoCta.formTitle}
                        </p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    placeholder="Jordan"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    placeholder="Wells"
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="work_email">Work Email</Label>
                                <Input
                                    id="work_email"
                                    name="work_email"
                                    type="email"
                                    placeholder="jordan@swimschool.com"
                                />
                            </div>
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="school_name">School Name</Label>
                                <Input
                                    id="school_name"
                                    name="school_name"
                                    placeholder="Aqua Stars Swim School"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="mt-6 w-full bg-navy-500 text-white hover:bg-navy-600"
                        >
                            {demoCta.submit}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
