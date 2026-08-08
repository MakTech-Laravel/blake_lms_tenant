import { Head } from '@inertiajs/react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeacherProfile() {
    return (
        <>
            <Head title="Profile" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <AquaPageHeader
                    title="Profile"
                    subtitle="Manage your learner profile details"
                />
                <Card className="max-w-2xl space-y-4 border-navy-50 bg-white p-6 shadow-sm">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" defaultValue="Jordan Wells" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue="jordan@aquacert.io" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            defaultValue="Swim Instructor"
                            readOnly
                        />
                    </div>
                    <Button
                        type="button"
                        className="bg-navy-500 text-white hover:bg-navy-600"
                    >
                        Save changes
                    </Button>
                </Card>
            </div>
        </>
    );
}
