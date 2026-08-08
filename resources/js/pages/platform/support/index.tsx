import { ModuleFixturePage } from '@/components/aquacert/module-fixture-page';
import { platformSupport } from '@/data/modules/platform-modules';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';
import type { PermissionKey } from '@/types/permissions';

/**
 * These are the most privileged actions in the app, so an unmapped row is
 * hidden rather than shown: a tool added to the fixture without a permission
 * here disappears instead of leaking to every support user.
 */
const supportToolPermissions: Record<string, PermissionKey> = {
    '1': PERMISSIONS.PLATFORM_SUPPORT.IMPERSONATE,
    '2': PERMISSIONS.PLATFORM_SUPPORT.AUDIT_EXPORT,
    '3': PERMISSIONS.PLATFORM_SUPPORT.PASSWORD_RESET,
    '4': PERMISSIONS.PLATFORM_SUPPORT.FEATURE_FLAGS,
};

export default function PlatformSupportPage() {
    const { can } = usePermission();

    const rows = platformSupport.rows.filter((row) => {
        const permission = supportToolPermissions[String(row.id)];

        return permission !== undefined && can(permission);
    });

    return (
        <ModuleFixturePage
            title={platformSupport.title}
            subtitle={platformSupport.subtitle}
            columns={platformSupport.columns}
            rows={rows}
            createLabel="Open Tool"
            createPermission={Object.values(supportToolPermissions)}
            exportPermission={PERMISSIONS.PLATFORM_SUPPORT.AUDIT_EXPORT}
        />
    );
}
