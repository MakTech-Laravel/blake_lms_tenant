import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { SectionCard } from '@/components/aquacert/section-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { platformSystemSettings } from '@/data/modules/platform-modules';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';
import type { PermissionKey } from '@/types/permissions';

const tabPermissions: Record<string, PermissionKey | undefined> = {
    integrations: PERMISSIONS.PLATFORM_SYSTEM.INTEGRATIONS_EDIT,
    security: PERMISSIONS.PLATFORM_SYSTEM.SECURITY_EDIT,
    billing: PERMISSIONS.PLATFORM_SYSTEM.BILLING_VIEW,
};

export default function PlatformSystemSettingsPage() {
    const { can } = usePermission();

    const tabs = platformSystemSettings.tabs.filter((tab) => {
        const permission = tabPermissions[tab.id];

        return !permission || can(permission);
    });

    const defaultTab = tabs[0]?.id ?? platformSystemSettings.tabs[0].id;

    return (
        <>
            <Head title={platformSystemSettings.title} />
            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title={platformSystemSettings.title}
                    subtitle={platformSystemSettings.subtitle}
                />
                <Tabs defaultValue={defaultTab}>
                    <TabsList className="flex h-auto flex-wrap gap-1 bg-navy-50/60 p-1">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-white data-[state=active]:text-navy-500"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent
                            key={tab.id}
                            value={tab.id}
                            className="mt-4"
                        >
                            <SectionCard title={tab.label}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {tab.fields.map((field) => (
                                        <div
                                            key={field.label}
                                            className="rounded-lg border border-navy-50 bg-white p-4"
                                        >
                                            <p className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                                {field.label}
                                            </p>
                                            <p className="mt-1 text-body-2 font-medium text-navy-500">
                                                {field.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </>
    );
}
