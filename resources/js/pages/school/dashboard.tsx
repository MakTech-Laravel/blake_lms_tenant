import { Head } from '@inertiajs/react';
import { BookOpen, Building2, FileBadge2, UserPlus, Users } from 'lucide-react';
import { ActivityFeed } from '@/components/aquacert/activity-feed';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import {
    AreaChartCard,
    BarChartCard,
    DonutChartCard,
} from '@/components/aquacert/charts';
import { QuickActions } from '@/components/aquacert/quick-actions';
import { SectionCard } from '@/components/aquacert/section-card';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { schoolOverview } from '@/data/aquacert-fixtures';

interface SchoolDashboardProps {
    stats?: {
        staff?: number;
        courses?: number;
        branches?: number;
        teachers?: number;
    };
}

export default function SchoolDashboard({ stats = {} }: SchoolDashboardProps) {
    const data = schoolOverview;

    return (
        <>
            <Head title="School Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title={data.greeting}
                    subtitle={data.subtitle}
                />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <AquaStatCard
                        label="Total Staff"
                        value={stats.staff ?? data.kpis[0].value}
                        icon={Users}
                        trend={data.kpis[0].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Active Staff"
                        value={data.kpis[1].value}
                        icon={Users}
                        trend={data.kpis[1].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="New Joiners"
                        value={data.kpis[2].value}
                        icon={UserPlus}
                        trend={data.kpis[2].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Locations"
                        value={stats.branches ?? data.kpis[3].value}
                        icon={Building2}
                        trend={data.kpis[3].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Assigned Courses"
                        value={stats.courses ?? data.kpis[4].value}
                        icon={BookOpen}
                        trend={data.kpis[4].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Completed Courses"
                        value={data.kpis[5].value}
                        icon={BookOpen}
                        trend={data.kpis[5].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Compliance Rate"
                        value={data.kpis[6].value}
                        icon={FileBadge2}
                        trend={data.kpis[6].trend}
                        trendTone="up"
                    />
                    <AquaStatCard
                        label="Certificates Issued"
                        value={data.kpis[7].value}
                        icon={FileBadge2}
                        trend={data.kpis[7].trend}
                        trendTone="up"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <AreaChartCard
                            title="Training Completion Trend"
                            data={data.completionTrend}
                            secondaryKey="secondary"
                            action={
                                <Button
                                    variant="outline"
                                    className="border-navy-100 text-navy-400"
                                    size="sm"
                                    type="button"
                                >
                                    Filter
                                </Button>
                            }
                        />
                    </div>
                    <DonutChartCard
                        title="Certificate Status"
                        data={data.certificates}
                        centerLabel="439"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <BarChartCard
                            title="Location Performance"
                            data={data.locationPerformance}
                            action={
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-aqua-600"
                                >
                                    View Report
                                </Button>
                            }
                        />
                    </div>
                    <ActivityFeed items={data.activity} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <SectionCard
                        title="Upcoming Deadlines"
                        className="lg:col-span-2"
                        action={
                            <Button
                                variant="link"
                                className="h-auto p-0 text-aqua-600"
                            >
                                View Report
                            </Button>
                        }
                    >
                        <ul className="space-y-3">
                            {data.deadlines.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border border-navy-50 px-3 py-3"
                                >
                                    <div>
                                        <p className="text-label-2 font-medium text-navy-500">
                                            {item.title}
                                        </p>
                                        <p className="text-body-4 text-navy-300">
                                            {item.meta}
                                        </p>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                    <QuickActions actions={data.quickActions} columns={2} />
                </div>
            </div>
        </>
    );
}
