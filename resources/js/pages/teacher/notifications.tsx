import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { Card } from '@/components/ui/card';
import { learnerOverview } from '@/data/aquacert-fixtures';

export default function TeacherNotifications() {
    return (
        <>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title="Notifications"
                    subtitle="Recent alerts for your learning account"
                />
                <Card className="divide-y divide-navy-50 border-navy-50 bg-white shadow-sm">
                    {learnerOverview.activity.map((item) => (
                        <div key={item.id} className="px-5 py-4">
                            <p className="text-label-2 font-medium text-navy-500">
                                {item.title}
                            </p>
                            <p className="mt-1 text-caption-1 text-navy-300">
                                {item.time}
                            </p>
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}
