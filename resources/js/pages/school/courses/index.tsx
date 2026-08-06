import { Head, router } from '@inertiajs/react';
import { BookOpen, Clock, GraduationCap, MapPin, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DataPagination } from '@/components/admin/data-pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useBranch } from '@/hooks/use-branch';
import { useTenant } from '@/hooks/use-tenant';
import courses from '@/routes/school/courses';
import type { BranchOption, Paginated } from '@/types/admin';

interface CourseListItem {
    id: number;
    title: string;
    slug: string;
    duration_hours: number | null;
    price: string;
    is_published: boolean;
    enrollments_count: number;
    branch: BranchOption | null;
}

interface CoursesIndexProps {
    courses: Paginated<CourseListItem>;
    branches: BranchOption[];
    filters: { search: string; branch: number | null };
}

const ALL_BRANCHES = 'all';

export default function CoursesIndex({
    courses: paginated,
    branches,
    filters,
}: CoursesIndexProps) {
    const { slug } = useTenant();
    const { isHeadOffice } = useBranch();
    const [search, setSearch] = useState(filters.search ?? '');
    const [branch, setBranch] = useState(
        filters.branch ? String(filters.branch) : ALL_BRANCHES,
    );
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                courses.index(slug).url,
                {
                    search: search || undefined,
                    branch: branch === ALL_BRANCHES ? undefined : branch,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, branch, slug]);

    return (
        <>
            <Head title="Courses" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Courses"
                    description="Certification courses offered by your school."
                    icon={BookOpen}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses…"
                            className="pl-9"
                        />
                    </div>
                    {/* Pinned staff already only receive their own branch's
                        courses from the server, so the filter is redundant. */}
                    {isHeadOffice && branches.length > 0 && (
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_BRANCHES}>
                                    All branches
                                </SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Course</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Duration
                                    </TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Enrolled
                                    </TableHead>
                                    {isHeadOffice && (
                                        <TableHead className="hidden lg:table-cell">
                                            Branch
                                        </TableHead>
                                    )}
                                    <TableHead className="text-right">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {paginated.data.map((course) => (
                                        <motion.tr
                                            key={course.id}
                                            layout
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 350,
                                                damping: 28,
                                            }}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <BookOpen className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {course.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            ${course.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {course.duration_hours
                                                        ? `${course.duration_hours}h`
                                                        : '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                    {course.enrollments_count}
                                                </span>
                                            </TableCell>
                                            {isHeadOffice && (
                                                <TableCell className="hidden lg:table-cell">
                                                    {course.branch ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1"
                                                        >
                                                            <MapPin className="h-3 w-3" />
                                                            {course.branch.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            School-wide
                                                        </span>
                                                    )}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={
                                                        course.is_published
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {course.is_published
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>

                        {paginated.data.length === 0 && (
                            <div className="px-4 py-16 text-center">
                                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
                                <h3 className="mt-4 text-sm font-semibold">
                                    No courses found
                                </h3>
                            </div>
                        )}
                    </div>

                    <DataPagination meta={paginated} />
                </div>
            </div>
        </>
    );
}
