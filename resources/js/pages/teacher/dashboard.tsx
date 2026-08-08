import { Head } from '@inertiajs/react';
import { Award, BookOpen, Calendar, ClipboardCheck, Route } from 'lucide-react';
import { ActivityFeed } from '@/components/aquacert/activity-feed';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import { AreaChartCard } from '@/components/aquacert/charts';
import { QuickActions } from '@/components/aquacert/quick-actions';
import { SectionCard } from '@/components/aquacert/section-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { learnerOverview } from '@/data/aquacert-fixtures';

export default function TeacherDashboard() {
    const data = learnerOverview;

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={data.greeting}
                    subtitle={data.subtitle}
                />

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <AquaStatCard
                        label="Assigned"
                        value={data.kpis[0].value}
                        icon={BookOpen}
                    />
                    <AquaStatCard
                        label="Completed"
                        value={data.kpis[1].value}
                        icon={Award}
                    />
                    <AquaStatCard
                        label="Pathways"
                        value={data.kpis[2].value}
                        icon={Route}
                    />
                    <AquaStatCard
                        label="Assessments"
                        value={data.kpis[3].value}
                        icon={ClipboardCheck}
                    />
                    <AquaStatCard
                        label="Certificates"
                        value={data.kpis[4].value}
                        icon={Award}
                    />
                    <AquaStatCard
                        label="Deadlines"
                        value={data.kpis[5].value}
                        icon={Calendar}
                    />
                </div>

                <SectionCard title="Continue Learning">
                    <div className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-navy-500 to-aqua-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                            <p className="text-caption-1 font-semibold tracking-wide text-aqua-100 uppercase">
                                Continue Learning
                            </p>
                            <h2 className="mt-1 text-h5 font-bold">
                                {data.continueLearning.title}
                            </h2>
                            <div className="mt-4 max-w-md">
                                <div className="mb-1 flex justify-between text-body-4 text-aqua-100">
                                    <span>Progress</span>
                                    <span>
                                        {data.continueLearning.progress}%
                                    </span>
                                </div>
                                <Progress
                                    value={data.continueLearning.progress}
                                    className="h-2 bg-white/20"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            className="bg-white text-navy-500 hover:bg-navy-50"
                        >
                            Resume
                        </Button>
                    </div>
                </SectionCard>

                <div className="grid gap-4 lg:grid-cols-2">
                    <SectionCard title="Learning Progress">
                        <div className="flex items-center gap-6">
                            <div className="flex size-28 flex-col items-center justify-center rounded-full border-8 border-aqua-500 text-center">
                                <span className="text-h4 font-bold text-navy-500">
                                    {data.progress.overall}%
                                </span>
                            </div>
                            <ul className="flex-1 space-y-3">
                                <li>
                                    <div className="mb-1 flex justify-between text-body-4">
                                        <span>Course Completion</span>
                                        <span>
                                            {data.progress.courseCompletion}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.progress.courseCompletion}
                                        className="h-2"
                                    />
                                </li>
                                <li>
                                    <div className="mb-1 flex justify-between text-body-4">
                                        <span>Pathway Progress</span>
                                        <span>
                                            {data.progress.pathwayProgress}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.progress.pathwayProgress}
                                        className="h-2"
                                    />
                                </li>
                                <li>
                                    <div className="mb-1 flex justify-between text-body-4">
                                        <span>Certifications</span>
                                        <span>
                                            {data.progress.certifications}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={data.progress.certifications}
                                        className="h-2"
                                    />
                                </li>
                            </ul>
                        </div>
                    </SectionCard>

                    <div>
                        <AreaChartCard
                            title="Activity This Week"
                            data={data.weeklyActivity}
                        />
                        <div className="mt-2 flex gap-4 text-body-4 text-navy-300">
                            <span>{data.weeklyStats.lessons} Lessons</span>
                            <span>{data.weeklyStats.quizzes} Quizzes</span>
                            <span>{data.weeklyStats.time} Time</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ActivityFeed items={data.activity} />
                    </div>
                    <QuickActions actions={data.quickActions} columns={1} />
                </div>
            </div>
        </>
    );
}
