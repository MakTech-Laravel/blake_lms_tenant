import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { ModuleEmptyState } from '@/components/aquacert/module-empty-state';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { learnerOverview } from '@/data/aquacert-fixtures';

type TabValue = 'all' | 'progress' | 'not-started' | 'completed' | 'overdue';

const statusMap: Record<TabValue, string | null> = {
    all: null,
    progress: 'In Progress',
    'not-started': 'Not Started',
    completed: 'Completed',
    overdue: 'Overdue',
};

export default function MyLearning() {
    const [tab, setTab] = useState<TabValue>('all');
    const [query, setQuery] = useState('');

    const courses = useMemo(() => {
        const status = statusMap[tab];

        return learnerOverview.courses.filter((course) => {
            const matchesTab = status === null || course.status === status;
            const matchesQuery =
                query.trim() === '' ||
                course.title.toLowerCase().includes(query.toLowerCase());

            return matchesTab && matchesQuery;
        });
    }, [tab, query]);

    return (
        <>
            <Head title="My Learning" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="My Learning"
                    subtitle={`${learnerOverview.courses.length} courses assigned`}
                />

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs
                        value={tab}
                        onValueChange={(value) => setTab(value as TabValue)}
                    >
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="progress">
                                In Progress
                            </TabsTrigger>
                            <TabsTrigger value="not-started">
                                Not Started
                            </TabsTrigger>
                            <TabsTrigger value="completed">
                                Completed
                            </TabsTrigger>
                            <TabsTrigger value="overdue">Overdue</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Input
                        placeholder="Search courses..."
                        className="max-w-sm border-navy-100"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>

                {courses.length === 0 ? (
                    <ModuleEmptyState
                        title="No courses match"
                        description="Try another filter or clear your search."
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="overflow-hidden border-navy-50 bg-white p-0 shadow-sm"
                            >
                                <div className="relative h-36 bg-gradient-to-br from-navy-500 to-aqua-500">
                                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-caption-1 font-semibold text-navy-500">
                                        {course.category}
                                    </span>
                                </div>
                                <div className="space-y-3 p-4">
                                    <h3 className="text-label-1 font-semibold text-navy-500">
                                        {course.title}
                                    </h3>
                                    <p className="text-body-4 text-navy-300">
                                        {course.duration} · {course.modules}{' '}
                                        modules
                                    </p>
                                    <Progress
                                        value={course.progress}
                                        className="h-2"
                                    />
                                    <div className="flex items-center justify-between gap-2">
                                        <StatusBadge status={course.status} />
                                        <Button
                                            size="sm"
                                            className="bg-navy-500 text-white hover:bg-navy-600"
                                            type="button"
                                        >
                                            {course.status === 'Completed'
                                                ? 'Review'
                                                : course.status ===
                                                    'Not Started'
                                                  ? 'Start'
                                                  : 'Continue'}
                                        </Button>
                                    </div>
                                    <p className="text-caption-1 text-navy-300">
                                        Due {course.due}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
