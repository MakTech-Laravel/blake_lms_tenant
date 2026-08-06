import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { platformAccess } from '@/data/modules/platform-modules';
import roles from '@/routes/platform/roles';

export default function PlatformAccessPage() {
    return (
        <ModuleFixturePage
            title={platformAccess.title}
            subtitle={platformAccess.subtitle}
            columns={platformAccess.columns}
            rows={platformAccess.rows}
            createLabel="Create Role"
            createHref={roles.create().url}
            extraActions={
                <Button asChild variant="outline" className="border-navy-100 text-navy-400">
                    <Link href={roles.index().url}>Manage roles</Link>
                </Button>
            }
        />
    );
}
