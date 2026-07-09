import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { UserForm } from '@/components/admin/user-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes/platform';
import users from '@/routes/platform/users';
import type { AdminUser, RoleRef } from '@/types/admin';

interface EditUserProps {
    user: AdminUser;
    roles: RoleRef[];
    userRoles: string[];
    isLastSuperAdmin: boolean;
}

export default function EditUser({
    user,
    roles,
    userRoles,
    isLastSuperAdmin,
}: EditUserProps) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Edit user"
                    description={`Update ${user.name}'s account and roles.`}
                    icon={Pencil}
                >
                    <Button variant="outline" asChild>
                        <Link href={users.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back to users
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
                    <UserForm
                        action={users.update(user.id)}
                        roles={roles}
                        isEdit
                        currentAvatar={user.avatar}
                        isLastSuperAdmin={isLastSuperAdmin}
                        defaults={{
                            name: user.name,
                            email: user.email,
                            roles: userRoles,
                        }}
                        onCancel={() => router.visit(users.index().url)}
                    />
                </div>
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: users.index() },
        { title: 'Edit', href: users.index() },
    ],
};
