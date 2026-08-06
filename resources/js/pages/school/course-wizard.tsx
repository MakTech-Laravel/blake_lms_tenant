import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import FileUpload from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const steps = [
    { id: 1, title: 'Course Details', description: 'Name, category, duration' },
    { id: 2, title: 'Training Video', description: 'Upload or link content' },
    { id: 3, title: 'Quiz', description: 'Knowledge check settings' },
    {
        id: 4,
        title: 'Assignment',
        description: 'Audience, due date, reminders',
    },
];

export default function CourseWizard() {
    const [step, setStep] = useState(1);
    const [thumbnail, setThumbnail] = useState<File | File[] | null>(null);
    const [video, setVideo] = useState<File | File[] | null>(null);

    return (
        <>
            <Head title="Create Course Wizard" />
            <div className="flex h-full flex-1 flex-col gap-6 bg-canvas p-4 md:p-6">
                <AquaPageHeader
                    title="Create Course Wizard"
                    subtitle="Build a new training course for your school staff."
                />

                <div className="grid gap-3 md:grid-cols-4">
                    {steps.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setStep(item.id)}
                            className={cn(
                                'rounded-xl border p-4 text-left transition-colors',
                                step === item.id
                                    ? 'border-navy-500 bg-white shadow-sm'
                                    : 'border-navy-50 bg-aqua-50/40',
                            )}
                        >
                            <p className="text-label-1 font-semibold text-navy-500">
                                {item.title}
                            </p>
                            <p className="mt-1 text-body-4 text-navy-300">
                                {item.description}
                            </p>
                        </button>
                    ))}
                </div>

                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-h6 font-semibold text-navy-500">
                                    Course details
                                </h2>
                                <p className="text-body-2 text-aqua-600">
                                    Set the base course information learners and
                                    managers will see.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter course title"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select defaultValue="safety">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="safety">
                                                Safety
                                            </SelectItem>
                                            <SelectItem value="emergency">
                                                Emergency
                                            </SelectItem>
                                            <SelectItem value="operations">
                                                Operations
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input
                                        id="duration"
                                        placeholder="e.g., 4 hours"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the course content and objectives..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Thumbnail</Label>
                                <FileUpload
                                    value={thumbnail}
                                    onChange={setThumbnail}
                                    accept="image/png,image/jpeg"
                                    maxFiles={1}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-h6 font-semibold text-navy-500">
                                Training video
                            </h2>
                            <p className="text-body-2 text-aqua-600">
                                Upload a video file or paste a streaming link.
                            </p>
                            <FileUpload
                                value={video}
                                onChange={setVideo}
                                accept="video/*"
                                maxFiles={1}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="video_url">Or video URL</Label>
                                <Input id="video_url" placeholder="https://" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-h6 font-semibold text-navy-500">
                                Quiz
                            </h2>
                            <p className="text-body-2 text-aqua-600">
                                Configure knowledge check settings for this
                                course.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="pass_mark">Pass mark (%)</Label>
                                <Input id="pass_mark" defaultValue="80" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="attempts">
                                    Allowed attempts
                                </Label>
                                <Input id="attempts" defaultValue="3" />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <h2 className="text-h6 font-semibold text-navy-500">
                                Assignment
                            </h2>
                            <p className="text-body-2 text-aqua-600">
                                Choose audience, due date, and reminder cadence.
                            </p>
                            <div className="grid gap-2">
                                <Label htmlFor="audience">Audience</Label>
                                <Input
                                    id="audience"
                                    placeholder="All lifeguards"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="due">Due date</Label>
                                <Input id="due" type="date" />
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-aqua-600"
                        >
                            Cancel
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={step === 1}
                                onClick={() =>
                                    setStep((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                            >
                                Back
                            </Button>
                            <Button type="button" variant="outline">
                                Save as Draft
                            </Button>
                            <Button
                                type="button"
                                className="bg-navy-500 text-white hover:bg-navy-600"
                                onClick={() =>
                                    setStep((current) =>
                                        Math.min(4, current + 1),
                                    )
                                }
                            >
                                {step === 4 ? 'Finish' : 'Next Step'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
