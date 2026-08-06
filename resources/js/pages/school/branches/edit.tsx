import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { BranchForm } from '@/components/admin/branch-form';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/use-tenant';
import branches from '@/routes/school/branches';

interface EditBranchProps {
    branch: {
        id: number;
        name: string;
        slug: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        is_active: boolean;
        users_count: number;
    };
}

export default function EditBranch({ branch }: EditBranchProps) {
    const { slug } = useTenant();

    return (
        <>
            <Head title={`Edit ${branch.name}`} />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Edit branch"
                    description={`Update the ${branch.name} branch.`}
                    icon={MapPin}
                >
                    <Button variant="outline" asChild>
                        <Link href={branches.index(slug).url}>
                            <ArrowLeft className="h-4 w-4" /> Back to branches
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <BranchForm
                        action={branches.update([slug, branch.slug])}
                        isEdit
                        staffCount={branch.users_count}
                        defaults={{
                            name: branch.name,
                            slug: branch.slug,
                            email: branch.email,
                            phone: branch.phone,
                            address: branch.address,
                            is_active: branch.is_active,
                        }}
                        onCancel={() => router.visit(branches.index(slug).url)}
                    />
                </div>
            </div>
        </>
    );
}
