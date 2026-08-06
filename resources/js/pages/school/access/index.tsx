import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { schoolAccess } from '@/data/modules/school-modules';
import { useTenant } from '@/hooks/use-tenant';
import roles from '@/routes/school/roles';

export default function SchoolAccessPage() {
    const { slug } = useTenant();

    return (
        <ModuleFixturePage
            title={schoolAccess.title}
            subtitle={schoolAccess.subtitle}
            columns={schoolAccess.columns}
            rows={schoolAccess.rows}
            createLabel="Create Role"
            createHref={roles.create(slug).url}
            extraActions={
                <Button asChild variant="outline" className="border-navy-100 text-navy-400">
                    <Link href={roles.index(slug).url}>Manage roles</Link>
                </Button>
            }
        />
    );
}
