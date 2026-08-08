import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { RoleForm } from '@/components/admin/role-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/platform';
import roles from '@/routes/platform/roles';
import type { PermissionOption } from '@/types/admin';

export default function CreateRole({
    permissions,
}: {
    permissions: PermissionOption[];
}) {
    return (
        <>
            <Head title="Create role" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-[#f8fafc] p-4 md:p-6">
                <AquaPageHeader
                    title="Create role"
                    subtitle="Name the role and grant it permissions."
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
                        action={roles.store()}
                        permissions={permissions}
                        onCancel={() => router.visit(roles.index().url)}
                    />
                </Card>
            </div>
        </>
    );
}

CreateRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Roles & Permissions', href: roles.index() },
        { title: 'Create', href: roles.create() },
    ],
};
