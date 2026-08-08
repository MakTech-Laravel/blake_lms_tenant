import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { OrganizationForm } from '@/components/aquacert/organizations/organization-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dashboard } from '@/routes/platform';
import organizations from '@/routes/platform/organizations';
import type { PlanOption } from '@/types/admin';

type FilterOption = { value: string; label: string };

interface CreateOrganizationProps {
    planOptions: PlanOption[];
    regionOptions: FilterOption[];
    statusOptions: FilterOption[];
}

export default function CreateOrganization({
    planOptions,
    regionOptions,
    statusOptions,
}: CreateOrganizationProps) {
    return (
        <>
            <Head title="Create organization" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Create organization"
                    subtitle="Register a swim school and set up its subscription."
                    actions={
                        <Button
                            variant="outline"
                            asChild
                            className="border-navy-100 text-navy-400"
                        >
                            <Link href={organizations.index().url}>
                                <ArrowLeft className="size-4" />
                                Back to organizations
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    <OrganizationForm
                        action={organizations.store()}
                        planOptions={planOptions}
                        regionOptions={regionOptions}
                        statusOptions={statusOptions}
                        onCancel={() =>
                            router.visit(organizations.index().url)
                        }
                    />
                </Card>
            </div>
        </>
    );
}

CreateOrganization.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Organizations', href: organizations.index() },
        { title: 'Create', href: organizations.create() },
    ],
};
