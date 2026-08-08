import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { RoleForm } from '@/components/admin/role-form';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/platform';
import roles from '@/routes/platform/roles';
import type { AdminRoleDetail, PermissionOption } from '@/types/admin';

interface EditRoleProps {
    role: AdminRoleDetail;
    permissions: PermissionOption[];
}

export default function EditRole({ role, permissions }: EditRoleProps) {
    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Edit role"
                    subtitle={`Update the ${role.name} role and its permissions.`}
                    actions={
                        <Button
                            variant="outline"
                            asChild
                            className="border-navy-100 text-navy-400"
                        >
                            <Link href={roles.index().url}>
                                <ArrowLeft className="size-4" />
                                Back to roles
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    <RoleForm
                        action={roles.update(role.id)}
                        permissions={permissions}
                        isEdit
                        locked={role.is_super_admin}
                        defaults={{
                            name: role.name,
                            permissions: role.permissions,
                        }}
                        onCancel={() => router.visit(roles.index().url)}
                    />
                </Card>
            </div>
        </>
    );
}

EditRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles & Permissions', href: roles.index() },
        { title: 'Edit', href: roles.index() },
    ],
};
