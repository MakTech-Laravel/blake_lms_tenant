import { Head } from '@inertiajs/react';
import { GraduationCap, Layers, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { useTenant } from '@/hooks/use-tenant';

interface SchoolDashboardProps {
    stats: {
        staff: number;
        courses: number;
        enrollments: number;
    };
}

export default function SchoolDashboard({ stats }: SchoolDashboardProps) {
    const school = useTenant();

    return (
        <>
            <Head title={`${school.name} — Dashboard`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={school.name}
                    description="Manage your school's staff, roles, and courses."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Staff" value={stats.staff} icon={Users} />
                    <StatCard
                        label="Courses"
                        value={stats.courses}
                        icon={Layers}
                    />
                    <StatCard
                        label="Enrollments"
                        value={stats.enrollments}
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
