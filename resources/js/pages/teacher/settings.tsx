import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function TeacherSettings() {
    return (
        <>
            <Head title="Settings" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Settings"
                    subtitle="Notification and learning preferences"
                />
                <Card className="max-w-2xl space-y-5 border-navy-50 bg-white p-6 shadow-sm">
                    {[
                        'Email me when a course is assigned',
                        'Remind me about upcoming deadlines',
                        'Notify me when certificates are issued',
                    ].map((label) => (
                        <div
                            key={label}
                            className="flex items-center justify-between gap-4"
                        >
                            <Label className="text-body-2 text-navy-500">
                                {label}
                            </Label>
                            <Switch defaultChecked />
                        </div>
                    ))}
                </Card>
            </div>
        </>
    );
}
