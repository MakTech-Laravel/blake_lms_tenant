import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ShieldPlus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { RoleForm } from '@/components/admin/role-form';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/use-tenant';
import roles from '@/routes/school/roles';
import type { PermissionOption } from '@/types/admin';

export default function CreateRole({
    permissions,
}: {
    permissions: PermissionOption[];
}) {
    const { slug } = useTenant();

    return (
        <>
            <Head title="Create role" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create role"
                    description="Name the role and grant it permissions."
                    icon={ShieldPlus}
                >
                    <Button variant="outline" asChild>
                        <Link href={roles.index(slug).url}>
                            <ArrowLeft className="h-4 w-4" /> Back to roles
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <RoleForm
                        action={roles.store(slug)}
                        permissions={permissions}
                        onCancel={() => router.visit(roles.index(slug).url)}
                    />
                </div>
            </div>
        </>
    );
}
