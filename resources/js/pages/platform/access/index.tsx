import { Link } from '@inertiajs/react';
import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { Button } from '@/components/ui/button';
import { platformAccess } from '@/data/modules/platform-modules';
import { usePermission } from '@/hooks/use-permissions';
import roles from '@/routes/platform/roles';
import { PERMISSIONS } from '@/types/permissions';

export default function PlatformAccessPage() {
    const { can } = usePermission();

    return (
        <ModuleFixturePage
            title={platformAccess.title}
            subtitle={platformAccess.subtitle}
            columns={platformAccess.columns}
            rows={platformAccess.rows}
            createLabel="Create Role"
            createHref={roles.create().url}
            createPermission={PERMISSIONS.ROLES.CREATE}
            extraActions={
                can(PERMISSIONS.ROLES.INDEX) ? (
                    <Button
                        asChild
                        variant="outline"
                        className="border-navy-100 text-navy-400"
                    >
                        <Link href={roles.index().url}>Manage roles</Link>
                    </Button>
                ) : null
            }
        />
    );
}
