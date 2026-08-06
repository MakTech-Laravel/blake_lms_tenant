import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';
import { useTenant } from '@/hooks/use-tenant';

export default function SchoolCoursesUiPage() {
    const { slug } = useTenant();
    const { courses } = useSchoolModuleVariant();

    return (
        <ModuleFixturePage
            title={courses.title}
            subtitle={courses.subtitle}
            columns={courses.columns}
            rows={courses.rows}
            createLabel="Create Course"
            extraActions={
                <Button asChild variant="outline" className="border-navy-100 text-navy-400">
                    <Link href={`/school/${slug}/courses/wizard`}>Open wizard</Link>
                </Button>
            }
        />
    );
}
