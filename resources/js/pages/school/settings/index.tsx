import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { SectionCard } from '@/components/aquacert/section-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { schoolSettings } from '@/data/modules/school-modules';

export default function SchoolSettingsPage() {
    return (
        <>
            <Head title={schoolSettings.title} />
            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title={schoolSettings.title}
                    subtitle={schoolSettings.subtitle}
                />
                <Tabs defaultValue={schoolSettings.tabs[0].id}>
                    <TabsList className="flex h-auto flex-wrap gap-1 bg-navy-50/60 p-1">
                        {schoolSettings.tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-white data-[state=active]:text-navy-500"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {schoolSettings.tabs.map((tab) => (
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
