import { Head } from '@inertiajs/react';
import {
    Building2,
    FileBadge2,
    GraduationCap,
    Layers,
    MapPin,
    Users,
} from 'lucide-react';
import { ActivityFeed } from '@/components/aquacert/activity-feed';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { AreaChartCard, DonutChartCard } from '@/components/aquacert/charts';
import { QuickActions } from '@/components/aquacert/quick-actions';
import { SectionCard } from '@/components/aquacert/section-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { platformOverview } from '@/data/aquacert-fixtures';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';

interface PlatformDashboardProps {
    stats: {
        schools: number;
        staff: number;
        courses: number;
        teachers: number;
    };
}

export default function PlatformDashboard({ stats }: PlatformDashboardProps) {
    const { can } = usePermission();
    const data = platformOverview;

    return (
        <>
            <Head title="Platform Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader title={data.title} subtitle={data.subtitle} />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                    <AquaStatCard
                        label="Total Organizations"
                        value={stats.schools || data.kpis[0].value}
                        icon={Building2}
                        trend={data.kpis[0].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Active Organizations"
                        value={data.kpis[1].value}
                        icon={Building2}
                        trend={data.kpis[1].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Trial Organizations"
                        value={data.kpis[2].value}
                        icon={Building2}
                        trend={data.kpis[2].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Suspended"
                        value={data.kpis[3].value}
                        icon={Building2}
                        trend={data.kpis[3].trend}
                        trendTone="down"
                    />
                    <AquaStatCard
                        label="Total Locations"
                        value={data.kpis[4].value}
                        icon={MapPin}
                    />
                    <AquaStatCard
                        label="Total Staff"
                        value={stats.staff || data.kpis[5].value}
                        icon={Users}
                    />
                    <AquaStatCard
                        label="Total Courses"
                        value={stats.courses || data.kpis[6].value}
                        icon={Layers}
                    />
                    <AquaStatCard
                        label="Certificates Issued"
                        value={data.kpis[7].value}
                        icon={FileBadge2}
                        trend={data.kpis[7].trend}
                        trendTone="up"
                    />
                </div>

                {can(PERMISSIONS.PLATFORM_SUBSCRIPTIONS.INDEX) && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <AreaChartCard
                                title="Revenue Trend"
                                data={data.revenue.series}
                            />
                            <div className="mt-3 flex flex-wrap gap-4 text-body-4 text-navy-300">
                                <span>
                                    MRR{' '}
                                    <strong className="text-navy-500">
                                        {data.revenue.mrr}
                                    </strong>
                                </span>
                                <span>
                                    ARR{' '}
                                    <strong className="text-navy-500">
                                        {data.revenue.arr}
                                    </strong>
                                </span>
                                <span>
                                    {data.revenue.renewals} Renewals this month
                                </span>
                                <span className="text-aqua-600">
                                    {data.revenue.growth}
                                </span>
                            </div>
                        </div>
                        <DonutChartCard
                            title="Subscription Growth"
                            data={data.subscriptions}
                            centerLabel="141"
                        />
                    </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    {can(PERMISSIONS.PLATFORM_LEARNING.INDEX) && (
                        <SectionCard
                            title="Learning Overview"
                            className="lg:col-span-1"
                        >
                            <div className="mb-4 grid grid-cols-2 gap-3 text-body-4">
                                <div>
                                    <p className="text-navy-300">Assigned</p>
                                    <p className="text-h6 font-bold text-navy-500">
                                        {data.learning.assigned}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-navy-300">Completed</p>
                                    <p className="text-h6 font-bold text-navy-500">
                                        {data.learning.completed}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-navy-300">Pathways</p>
                                    <p className="text-h6 font-bold text-navy-500">
                                        {data.learning.pathways}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-navy-300">Assessments</p>
                                    <p className="text-h6 font-bold text-navy-500">
                                        {data.learning.assessments}
                                    </p>
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {data.learning.courses.map((course) => (
                                    <li key={course.name}>
                                        <div className="mb-1 flex justify-between text-body-4">
                                            <span className="text-navy-400">
                                                {course.name}
                                            </span>
                                            <span className="font-semibold text-navy-500">
                                                {course.value}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={course.value}
                                            className="h-2"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>
                    )}

                    {can(PERMISSIONS.SETTINGS.VIEW) && (
                        <SectionCard title="System Health">
                            <div className="space-y-4 text-body-3">
                                <div>
                                    <div className="mb-1 flex justify-between">
                                        <span className="text-navy-300">
                                            Storage Usage
                                        </span>
                                        <span className="text-navy-500">
                                            {data.systemHealth.storage}
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.systemHealth.storagePercent}
                                        className="h-2"
                                    />
                                </div>
                                <p className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Email Delivery — {data.systemHealth.email}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    API Status — {data.systemHealth.api}
                                </p>
                                <p className="text-navy-400">
                                    Active Sessions:{' '}
                                    <strong className="text-navy-500">
                                        {data.systemHealth.sessions}
                                    </strong>
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-navy-100"
                                    type="button"
                                >
                                    System Settings
                                </Button>
                            </div>
                        </SectionCard>
                    )}

                    <div className="space-y-4">
                        <ActivityFeed items={data.activity} />
                        <QuickActions actions={data.quickActions} columns={2} />
                    </div>
                </div>

                <p className="sr-only">
                    Teachers count {stats.teachers} {GraduationCap.name}
                </p>
            </div>
        </>
    );
}
