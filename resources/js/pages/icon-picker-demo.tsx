import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import IconPickerDemoController from '@/actions/App/Http/Controllers/IconPickerDemoController';
import Heading from '@/components/heading';
import { LucideIconPicker } from '@/components/icons/lucide-icon-picker';
import type { LucideIconPickerHandle } from '@/components/icons/lucide-icon-picker';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getIconLabel, Icon } from '@/lib/icons';
import { dashboard } from '@/routes';
import { index as iconPickerDemo } from '@/routes/icon-picker-demo';

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

function Section({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                    {title}
                </h2>
                {badge ? <Badge variant="outline">{badge}</Badge> : null}
            </div>
            {children}
        </section>
    );
}

function SaveDemo({
    icon,
    selectedIcon,
    setSelectedIcon,
}: {
    icon: string;
    selectedIcon: string;
    setSelectedIcon: (icon: string) => void;
}) {
    return (
        <Section title="1 · Save to session" badge="collapsible · keep open">
            <p className="text-sm text-muted-foreground">
                Default behaviour: the panel stays open after you pick an icon.
                Submit to persist the selection in your session.
            </p>

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
        </Section>
    );
}

function CloseOnSelectDemo() {
    const [icon, setIcon] = useState('settings');

    return (
        <Section title="2 · Close on select" badge="closeOnSelect">
            <p className="text-sm text-muted-foreground">
                Pass <code>closeOnSelect</code> to collapse the panel after a
                pick — useful for dense forms.
            </p>
            <div className="max-w-xl">
                <LucideIconPicker
                    id="close-on-select"
                    value={icon}
                    onChange={setIcon}
                    closeOnSelect
                    clearSearchOnSelect
                    description={`Selected: ${icon}`}
                />
            </div>
        </Section>
    );
}

function DialogModeDemo() {
    const [icon, setIcon] = useState('sparkles');

    return (
        <Section title="3 · Dialog mode" badge='mode="dialog"'>
            <p className="text-sm text-muted-foreground">
                Opens the icon browser in a modal. Stays open after select by
                default; add <code>closeOnSelect</code> if you want it to dismiss.
            </p>
            <div className="max-w-xl">
                <LucideIconPicker
                    id="dialog-icon"
                    mode="dialog"
                    value={icon}
                    onChange={setIcon}
                    description="Opens in a dialog"
                    dialogTitle="Pick an icon"
                    dialogDescription="Search the Lucide catalog and choose one."
                />
            </div>
        </Section>
    );
}

function CustomClassNamesDemo() {
    const [icon, setIcon] = useState('palette');

    return (
        <Section title="4 · Custom classNames per slot" badge="classNames">
            <p className="text-sm text-muted-foreground">
                Every visual slot is overridable — same pattern as{' '}
                <code>FileUpload</code>.
            </p>
            <div className="max-w-xl">
                <LucideIconPicker
                    id="styled-icon"
                    value={icon}
                    onChange={setIcon}
                    description="Blue accent shell"
                    classNames={{
                        shell: 'rounded-2xl border-blue-300 bg-blue-50/50 shadow-none dark:border-blue-900 dark:bg-blue-950/30',
                        trigger: 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40',
                        triggerPreview:
                            'border-blue-200 bg-white dark:border-blue-800 dark:bg-blue-950',
                        triggerLabel: 'text-blue-900 dark:text-blue-100',
                        panel: 'bg-white/80 dark:bg-blue-950/20',
                        searchInput: 'border-blue-200 focus-visible:ring-blue-400',
                        grid: 'border-blue-200 bg-blue-50/40 dark:border-blue-900',
                        optionSelected:
                            'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/50',
                    }}
                />
            </div>
        </Section>
    );
}

function CuratedDemo() {
    const [icon, setIcon] = useState('book-open');

    return (
        <Section title="5 · Curated whitelist" badge="allowedIcons">
            <p className="text-sm text-muted-foreground">
                Limit the catalog to a product-specific allow-list.
            </p>
            <div className="max-w-xl">
                <LucideIconPicker
                    id="curated-icon"
                    value={icon}
                    onChange={setIcon}
                    allowedIcons={CURATED_ICONS}
                    label="Pick from curated icons"
                    description="Local-only demo (not saved)"
                    showSparkles
                />
            </div>
        </Section>
    );
}

function ImperativeRefDemo() {
    const [icon, setIcon] = useState('folder');
    const pickerRef = useRef<LucideIconPickerHandle>(null);

    return (
        <Section title="6 · Imperative ref" badge="open / close / clearSearch">
            <p className="text-sm text-muted-foreground">
                Control the picker from outside via{' '}
                <code>ref.current.open()</code>, <code>close()</code>, and{' '}
                <code>clearSearch()</code>.
            </p>
            <div className="flex max-w-xl flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pickerRef.current?.open()}
                    >
                        Open
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pickerRef.current?.close()}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pickerRef.current?.clearSearch()}
                    >
                        Clear search
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pickerRef.current?.focus()}
                    >
                        Focus trigger
                    </Button>
                </div>
                <LucideIconPicker
                    ref={pickerRef}
                    id="imperative-icon"
                    mode="dialog"
                    value={icon}
                    onChange={setIcon}
                    description="Driven by imperative handle"
                />
            </div>
        </Section>
    );
}

export default function IconPickerDemo({ icon }: { icon: string }) {
    const [savedIcon, setSavedIcon] = useState(icon);
    const [selectedIcon, setSelectedIcon] = useState(icon);

    if (icon !== savedIcon) {
        setSavedIcon(icon);
        setSelectedIcon(icon);
    }

    return (
        <>
            <Head title="Icon picker demo" />

            <div className="flex h-full flex-1 flex-col gap-10 overflow-x-auto p-4 md:p-6">
                <Heading
                    title="Icon picker demo"
                    description="Reusable LucideIconPicker — collapsible or dialog, slot classNames, and configurable close-on-select."
                />

                <SaveDemo
                    icon={icon}
                    selectedIcon={selectedIcon}
                    setSelectedIcon={setSelectedIcon}
                />

                <Separator />
                <CloseOnSelectDemo />

                <Separator />
                <DialogModeDemo />

                <Separator />
                <CustomClassNamesDemo />

                <Separator />
                <CuratedDemo />

                <Separator />
                <ImperativeRefDemo />
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
