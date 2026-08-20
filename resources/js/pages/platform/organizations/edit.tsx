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

interface EditableOrganization {
    id: number;
    slug: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    status: string;
    plan_id: number | null;
    monthly_price: string | null;
    trial_days: number;
}

interface EditOrganizationProps {
    organization: EditableOrganization;
    planOptions: PlanOption[];
    regionOptions: FilterOption[];
    statusOptions: FilterOption[];
}

export default function EditOrganization({
    organization,
    planOptions,
    regionOptions,
    statusOptions,
}: EditOrganizationProps) {
    return (
        <>
            <Head title={`Edit ${organization.name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title={`Edit ${organization.name}`}
                    subtitle="Update the organization's details and subscription."
                    actions={
                        <Button
                            variant="outline"
                            asChild
                            className="border-navy-100 text-navy-400"
                        >
                            <Link
                                href={
                                    organizations.show(organization.slug).url
                                }
                            >
                                <ArrowLeft className="size-4" />
                                Back to organization
                            </Link>
                        </Button>
                    }
                />

                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    <OrganizationForm
                        action={organizations.update(organization.slug)}
                        isEdit
                        planOptions={planOptions}
                        regionOptions={regionOptions}
                        statusOptions={statusOptions}
                        defaults={organization}
                        onCancel={() =>
                            router.visit(
                                organizations.show(organization.slug).url,
                            )
                        }
                    />
                </Card>
            </div>
        </>
    );
}

EditOrganization.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Organizations', href: organizations.index() },
        { title: 'Edit', href: organizations.index() },
    ],
};
