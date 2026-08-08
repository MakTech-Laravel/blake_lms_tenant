import { CheckCircle2, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { hero } from '@/data/landing';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-aqua-50/60 via-white to-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-aqua-100)_0%,_transparent_55%)] opacity-70" />

            <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <p className="text-label-3 font-semibold tracking-[0.14em] text-aqua-600 uppercase">
                        {hero.eyebrow}
                    </p>
                    <h1 className="mt-4 text-h3 font-bold text-navy-500 sm:text-h2 lg:text-title-2">
                        {hero.titleBefore}{' '}
                        <span className="text-navy-400">
                            {hero.titleHighlight}
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-body-2 text-navy-300 sm:text-body-1">
                        {hero.description}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Button
                            size="lg"
                            className="bg-navy-500 px-6 text-white hover:bg-navy-600"
                            asChild
                        >
                            <a href="#platform">
                                <Play className="size-4 fill-current" />
                                {hero.cta}
                            </a>
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    className="relative mx-auto mt-14 max-w-5xl"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="overflow-hidden rounded-2xl border border-navy-50 bg-white shadow-[0_30px_80px_-20px_rgba(3,38,78,0.35)]"
                    >
                        <img
                            src="/images/marketing/dashboard-mockup.jpg"
                            alt="AquaCert platform dashboard"
                            className="h-auto w-full"
                        />
                    </motion.div>

                    <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-navy-50 bg-white px-3 py-2 shadow-lg sm:left-8">
                        <CheckCircle2 className="size-4 text-aqua-500" />
                        <span className="text-label-3 font-semibold text-navy-500">
                            {hero.complianceBadge}
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
