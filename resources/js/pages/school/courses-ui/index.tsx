import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permissions';
import { useSchoolModuleVariant } from '@/hooks/use-school-module-variant';
import { useTenant } from '@/hooks/use-tenant';
import { PERMISSIONS } from '@/types/permissions';

export default function SchoolCoursesUiPage() {
    const { can } = usePermission();
    const { slug } = useTenant();
    const { courses } = useSchoolModuleVariant();
    const canCreate = can(PERMISSIONS.SCHOOL_COURSES.CREATE);

    return (
        <ModuleFixturePage
            title={courses.title}
            subtitle={courses.subtitle}
            columns={courses.columns}
            rows={courses.rows}
            createLabel="Create Course"
            createPermission={PERMISSIONS.SCHOOL_COURSES.CREATE}
            exportPermission={PERMISSIONS.SCHOOL_COURSES.EXPORT}
            extraActions={
                canCreate ? (
                    <Button
                        asChild
                        variant="outline"
                        className="border-navy-100 text-navy-400"
                    >
                        <Link href={`/school/${slug}/courses/wizard`}>
                            Open wizard
                        </Link>
                    </Button>
                ) : null
            }
        />
    );
}
