import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { UserForm } from '@/components/admin/user-form';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/use-tenant';
import users from '@/routes/school/users';
import type { BranchOption, RoleRef } from '@/types/admin';

interface CreateUserProps {
    roles: RoleRef[];
    branches: BranchOption[];
}

export default function CreateUser({ roles, branches }: CreateUserProps) {
    const { slug } = useTenant();

    return (
        <>
            <Head title="Create staff member" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create staff member"
                    description="Add a new account and assign roles."
                    icon={UserPlus}
                >
                    <Button variant="outline" asChild>
                        <Link href={users.index(slug).url}>
                            <ArrowLeft className="h-4 w-4" /> Back to staff
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-sm">
                    <UserForm
                        action={users.store(slug)}
                        roles={roles}
                        branches={branches}
                        onCancel={() => router.visit(users.index(slug).url)}
                    />
                </div>
            </div>
        </>
    );
}
