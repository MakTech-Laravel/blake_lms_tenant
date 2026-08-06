import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { schoolAccess } from '@/data/modules/school-modules';
import { usePermission } from '@/hooks/use-permissions';
import { useTenant } from '@/hooks/use-tenant';
import roles from '@/routes/school/roles';
import { PERMISSIONS } from '@/types/permissions';

export default function SchoolAccessPage() {
    const { can } = usePermission();
    const { slug } = useTenant();

    return (
        <ModuleFixturePage
            title={schoolAccess.title}
            subtitle={schoolAccess.subtitle}
            columns={schoolAccess.columns}
            rows={schoolAccess.rows}
            createLabel="Create Role"
            createHref={roles.create(slug).url}
            createPermission={PERMISSIONS.SCHOOL_ROLES.CREATE}
            extraActions={
                can(PERMISSIONS.SCHOOL_ROLES.INDEX) ? (
                    <Button
                        asChild
                        variant="outline"
                        className="border-navy-100 text-navy-400"
                    >
                        <Link href={roles.index(slug).url}>Manage roles</Link>
                    </Button>
                ) : null
            }
        />
    );
}
