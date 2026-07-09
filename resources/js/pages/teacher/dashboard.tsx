import { Head, usePage } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

interface TeacherDashboardProps {
    stats: {
        enrolled: number;
        completed: number;
        certificates: number;
    };
}

export default function TeacherDashboard({ stats }: TeacherDashboardProps) {
    const name = usePage().props.auth.user?.name ?? 'there';

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={`Welcome back, ${name}`}
                    description="Track your certification progress and certificates."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Enrolled courses"
                        value={stats.enrolled}
                        icon={BookOpen}
                    />
                    <StatCard
                        label="Completed"
                        value={stats.completed}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        label="Certificates"
                        value={stats.certificates}
                        icon={Award}
                    />
                </div>

                <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}
