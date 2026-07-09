import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { UserForm } from '@/components/admin/user-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/platform';
import users from '@/routes/platform/users';
import type { RoleRef } from '@/types/admin';

export default function CreateUser({ roles }: { roles: RoleRef[] }) {
    return (
        <>
            <Head title="Create user" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create user"
                    description="Add a new account and assign roles."
                    icon={UserPlus}
                >
                    <Button variant="outline" asChild>
                        <Link href={users.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back to users
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
                    <UserForm
                        action={users.store()}
                        roles={roles}
                        onCancel={() => router.visit(users.index().url)}
                    />
                </div>
            </div>
        </>
    );
}

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: users.index() },
        { title: 'Create', href: users.create() },
    ],
};
