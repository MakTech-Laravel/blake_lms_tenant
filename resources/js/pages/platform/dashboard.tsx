import { Head } from '@inertiajs/react';
import { Building2, GraduationCap, Layers, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

interface PlatformDashboardProps {
    stats: {
        schools: number;
        staff: number;
        courses: number;
        teachers: number;
    };
}

export default function PlatformDashboard({ stats }: PlatformDashboardProps) {
    return (
        <>
            <Head title="Platform Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Platform overview"
                    description="Manage schools, staff, and everything across the platform."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Schools" value={stats.schools} icon={Building2} />
                    <StatCard
                        label="Platform staff"
                        value={stats.staff}
                        icon={Users}
                    />
                    <StatCard label="Courses" value={stats.courses} icon={Layers} />
                    <StatCard
                        label="Teachers"
                        value={stats.teachers}
                        icon={GraduationCap}
                    />
                </div>

                <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}
