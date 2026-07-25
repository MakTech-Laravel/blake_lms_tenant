import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import IconPickerDemoController from '@/actions/App/Http/Controllers/IconPickerDemoController';
import Heading from '@/components/heading';
import { LucideIconPicker } from '@/components/icons/lucide-icon-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { getIconLabel, Icon } from '@/lib/icons';
import { index as iconPickerDemo } from '@/routes/icon-picker-demo';
import { dashboard } from '@/routes';

const CURATED_ICONS = [
    'book-open',
    'graduation-cap',
    'users',
    'settings',
    'bell',
    'calendar',
    'chart-column',
    'folder',
    'message-square',
    'sparkles',
];

export default function IconPickerDemo({ icon }: { icon: string }) {
    const [savedIcon, setSavedIcon] = useState(icon);
    const [selectedIcon, setSelectedIcon] = useState(icon);
    const [curatedIcon, setCuratedIcon] = useState('book-open');

    if (icon !== savedIcon) {
        setSavedIcon(icon);
        setSelectedIcon(icon);
    }

    return (
        <>
            <Head title="Icon picker demo" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Icon picker demo"
                    description="Pick a Lucide icon and save it. The selection is stored in your session so it survives a refresh."
                />

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <Form
                        {...IconPickerDemoController.store.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <LucideIconPicker
                                    id="demo-icon"
                                    name="icon"
                                    value={selectedIcon}
                                    onChange={setSelectedIcon}
                                    label="Search icons"
                                    description="Saved to your session"
                                    error={errors.icon}
                                    required
                                />

                                <InputError message={errors.icon} />

                                <div className="flex flex-wrap items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving…' : 'Save icon'}
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        Current value:{' '}
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {selectedIcon}
                                        </code>
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>

                    <aside className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/20 p-5">
                        <p className="text-sm font-medium text-foreground">
                            Saved preview
                        </p>
                        <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-background px-4 py-8">
                            <div className="flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
                                <Icon
                                    icon={icon}
                                    className="size-8 text-primary"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">
                                    {getIconLabel(icon)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {icon}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            This card shows the last saved icon from the server.
                            Change the picker and click Save to update it.
                        </p>
                    </aside>
                </div>

                <section className="space-y-4 border-t border-border/60 pt-8">
                    <Heading
                        variant="small"
                        title="Curated whitelist"
                        description="Same picker limited to a small allowedIcons set — useful for product forms."
                    />
                    <div className="max-w-xl">
                        <LucideIconPicker
                            id="curated-icon"
                            value={curatedIcon}
                            onChange={setCuratedIcon}
                            allowedIcons={CURATED_ICONS}
                            label="Pick from curated icons"
                            description="Local-only demo (not saved)"
                            showSparkles
                        />
                    </div>
                </section>
            </div>
        </>
    );
}

IconPickerDemo.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Icon picker demo',
            href: iconPickerDemo(),
        },
    ],
};
