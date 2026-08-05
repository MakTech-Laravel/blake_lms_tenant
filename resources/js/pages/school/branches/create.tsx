import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { BranchForm } from '@/components/admin/branch-form';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/use-tenant';
import branches from '@/routes/school/branches';

export default function CreateBranch() {
    const { slug } = useTenant();

    return (
        <>
            <Head title="Create branch" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Create branch"
                    description="Add a location. Staff pinned to it will only see its data."
                    icon={Building2}
                >
                    <Button variant="outline" asChild>
                        <Link href={branches.index(slug).url}>
                            <ArrowLeft className="h-4 w-4" /> Back to branches
                        </Link>
                    </Button>
                </AdminPageHeader>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <BranchForm
                        action={branches.store(slug)}
                        onCancel={() => router.visit(branches.index(slug).url)}
                    />
                </div>
            </div>
        </>
    );
}
