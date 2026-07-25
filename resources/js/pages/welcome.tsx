import { Head, Link, usePage } from '@inertiajs/react';
import type { Variants } from 'motion/react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import type { ReactNode, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard, login, register } from '@/routes';
import { PERMISSIONS } from '@/types/permissions';
import { LucideIconPicker } from '@/components/icons/lucide-icon-picker';

// Strict TypeScript Interfaces
interface FeatureCardProps {
    title: string;
    desc: string;
    badge?: string;
    icon: ReactNode;
}

interface PageProps {
    auth: {
        user: any | null;
    };
    [key: string]: any;
}

// 1. Aceternity Interactive Spotlight Card Component
function SpotlightCard({ title, desc, badge, icon }: FeatureCardProps) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className="group relative flex max-w-full flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 sm:flex-row dark:border-zinc-800/80 dark:bg-zinc-900/30"
        >
            {/* Spotlight Mask Effect following cursor */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            350px circle at ${mouseX}px ${mouseY}px,
                            rgba(99, 102, 241, 0.12),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Glowing Corner border flash on hover */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl border border-indigo-500/30 opacity-0 transition duration-300 group-hover:opacity-100 dark:border-indigo-500/20"
                style={{
                    maskImage: useMotionTemplate`
                        radial-gradient(
                            120px circle at ${mouseX}px ${mouseY}px,
                            black,
                            transparent
                        )
                    `,
                    WebkitMaskImage: useMotionTemplate`
                        radial-gradient(
                            120px circle at ${mouseX}px ${mouseY}px,
                            black,
                            transparent
                        )
                    `,
                }}
            />

            <div className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-700/50 dark:bg-zinc-800/60">
                {cardIconWrapper(icon)}
            </div>
            <div className="z-10 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-zinc-100">
                    <h3>{title}</h3>
                    {badge && (
                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:border-indigo-900/20 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-zinc-400">
                    {desc}
                </p>
            </div>
        </div>
    );
}

// Helper to keep icons structured clean
function cardIconWrapper(icon: ReactNode) {
    return icon;
}

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<PageProps>().props;
    const { can, hasRole } = usePermission();

    console.log(auth);
    // Entrance Stagger Animations
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.05 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 100, damping: 16 },
        },
    };

    const features: FeatureCardProps[] = [
        {
            title: 'Real-Time Telemetry',
            desc: 'Stream multi-instance states instantly with optimized messaging queues and lightweight pub-sub connections.',
            badge: 'Active',
            icon: (
                <svg
                    className="h-5 w-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            ),
        },
        {
            title: 'Distributed Analytics',
            desc: 'Aggregate high-throughput data points and inspect structured user behavior directly from a modern view.',
            icon: (
                <svg
                    className="h-5 w-5 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2"
                    />
                </svg>
            ),
        },
        {
            title: 'Automated Pipelines',
            desc: 'Schedule recursive event processors and monitor backpressure without extra architecture middleware.',
            badge: 'Core',
            icon: (
                <svg
                    className="h-5 w-5 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2"
                    />
                </svg>
            ),
        },
    ];

    return (
        <>
            <Head>
                <title>Welcome to Nexus</title>
                <meta name="description" content="Welcome to Nexus" />
                <meta name="keywords" content="Nexus, Welcome" />
            </Head>

            {/* Main Wrapper Container */}
            <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
                {/* 2. Aceternity Inline High-Fidelity Grid Line Background */}
                <div className="absolute inset-0 z-0 opacity-40 dark:opacity-70">
                    <svg
                        className="h-full w-full [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)] stroke-slate-200 dark:stroke-zinc-800/60"
                        aria-hidden="true"
                    >
                        <defs>
                            <pattern
                                id="grid-pattern"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                                x="50%"
                                y="-1"
                            >
                                <path d="M.5 40V.5H40" fill="none" />
                            </pattern>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            strokeWidth={0}
                            fill="url(#grid-pattern)"
                        />
                    </svg>
                </div>

                {/* Ambient colorful underlying blur element */}
                <div className="pointer-events-none absolute top-1/4 left-1/2 z-0 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/5" />

                {/* Premium Navigation Header */}
                <header className="relative z-50 w-full border-b border-slate-200/50 bg-slate-50/60 backdrop-blur-md dark:border-zinc-900/50 dark:bg-zinc-950/60">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/10">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2H3m2 0a2 2 0 012-2h.01"
                                    />
                                </svg>
                            </span>
                            <span className="bg-gradient-to-r from-slate-950 to-slate-700 bg-clip-text text-transparent dark:from-zinc-50 dark:to-zinc-300">
                                Nexus
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <>
                                    <Link
                                        href={dashboard()}
                                        className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-slate-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                    >
                                        Sign in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                            {hasRole('admin') && (
                                <Button>Only Admin can see this</Button>
                            )}
                            {can(PERMISSIONS.POSTS.DELETE) && (
                                <Button>
                                    Only {PERMISSIONS.POSTS.DELETE} permission
                                    can see this
                                </Button>
                            )}
                            {can(PERMISSIONS.POSTS.VIEW) && (
                                <Button>
                                    Only {PERMISSIONS.POSTS.VIEW} permission can
                                    see this
                                </Button>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Main Hero Viewport Area */}
                <main className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
                    <motion.div
                        className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Typography Block */}
                        <div className="flex flex-col justify-center lg:col-span-7">
                            <motion.div
                                variants={itemVariants}
                                className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-950/30 dark:text-indigo-400"
                            >
                                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                                Premium Interface Matrix Ready
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
                            >
                                Engineering meets <br />
                                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    high-fidelity design.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-xl dark:text-zinc-400"
                            >
                                Experience a complete workspace architecture
                                optimized for performance, wrapped seamlessly in
                                clean modern grid vectors and motion primitives.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="mt-10 flex flex-wrap gap-4"
                            >
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all hover:opacity-95"
                                >
                                    Launch Application
                                    <svg
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Feature Array Block using Spotlight Card Modules */}
                        <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-5">
                            {features.map((feature, idx) => (
                                <motion.div key={idx} variants={itemVariants}>
                                    <SpotlightCard {...feature} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div className="mt-10">
                        <LucideIconPicker />
                    </motion.div>
                </main>

                <footer className="relative z-10 py-10 text-center text-xs tracking-wide text-slate-400 dark:text-zinc-600">
                    &copy; {new Date().getFullYear()} Nexus Inc. All rights
                    reserved.
                </footer>
            </div>
        </>
    );
}
