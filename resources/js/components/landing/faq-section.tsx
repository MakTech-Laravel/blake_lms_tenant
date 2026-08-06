import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { faqs } from '@/data/landing';

export function FaqSection() {
    return (
        <section
            id="resources"
            className="scroll-mt-20 bg-white py-20 sm:py-24"
        >
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-h4 font-bold text-navy-500 sm:text-h3">
                    Frequently Asked Questions
                </h2>

                <Accordion
                    type="single"
                    collapsible
                    defaultValue="item-0"
                    className="mt-10"
                >
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={faq.question}
                            value={`item-${index}`}
                        >
                            <AccordionTrigger className="text-left text-label-1 font-semibold text-navy-500 hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-body-2 text-navy-300">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
