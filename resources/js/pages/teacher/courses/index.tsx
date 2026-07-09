import { Head } from '@inertiajs/react';
import { BookOpen, Clock } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

interface EnrollmentItem {
    id: number;
    course_title: string;
    duration_hours: number | null;
    status: string;
    progress: number;
    enrolled_at: string | null;
}

interface CoursesIndexProps {
    enrollments: EnrollmentItem[];
}

const STATUS_VARIANT: Record<
    string,
    'default' | 'secondary' | 'outline'
> = {
    completed: 'default',
    in_progress: 'secondary',
    enrolled: 'outline',
};

export default function CoursesIndex({ enrollments }: CoursesIndexProps) {
    return (
        <>
            <Head title="My Courses" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Heading
                    title="My Courses"
                    description="Courses you are enrolled in and your progress."
                />

                {enrollments.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-16 text-center">
                        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        <h3 className="mt-4 text-sm font-semibold">
                            You are not enrolled in any courses yet
                        </h3>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {enrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="rounded-xl border bg-card p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold">
                                            {enrollment.course_title}
                                        </h3>
                                        {enrollment.duration_hours && (
                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                {enrollment.duration_hours} hours
                                            </p>
                                        )}
                                    </div>
                                    <Badge
                                        variant={
                                            STATUS_VARIANT[enrollment.status] ??
                                            'outline'
                                        }
                                        className="capitalize"
                                    >
                                        {enrollment.status.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="mt-4">
                                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span className="tabular-nums">
                                            {enrollment.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${enrollment.progress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
