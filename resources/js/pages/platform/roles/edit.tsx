import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { RoleForm } from '@/components/admin/role-form';
import { Button } from '@/components/ui/button';
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

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Edit role"
                    description={`Update the ${role.name} role and its permissions.`}
                    icon={ShieldCheck}
                >
                    <Button variant="outline" asChild>
                        <Link href={roles.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back to roles
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
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
                </div>
            </div>
        </>
    );
}

EditRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles', href: roles.index() },
        { title: 'Edit', href: roles.index() },
    ],
};
