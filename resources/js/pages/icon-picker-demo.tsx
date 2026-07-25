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

function Canvas({
    title,
    badge,
    caption,
    children,
}: {
    title: string;
    badge?: string;
    caption: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">
                    {title}
                </h2>
                {badge ? <Badge variant="outline">{badge}</Badge> : null}
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">{caption}</p>
            <div className="rounded-2xl border border-border/70 bg-muted/15 p-5 md:p-6">
                {children}
            </div>
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
        <Canvas
            title="1 · Field + collapsible"
            badge="save · recents · categories"
            caption="Default form control. Panel stays open after pick; submit persists to session."
        >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                <Form
                    {...IconPickerDemoController.store.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <LucideIconPicker
                                id="demo-icon"
                                name="icon"
                                value={selectedIcon}
                                onChange={setSelectedIcon}
                                label="Search icons"
                                description={selectedIcon}
                                error={errors.icon}
                                required
                            />
                            <InputError message={errors.icon} />
                            <div className="flex flex-wrap items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save icon'}
                                </Button>
                                <code className="rounded-md bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
                                    {selectedIcon}
                                </code>
                            </div>
                        </>
                    )}
                </Form>

                <aside className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-8">
                    <div className="flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
                        <Icon icon={icon} className="size-8" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">
                            {getIconLabel(icon)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                            {icon}
                        </p>
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground">
                        Last saved from server
                    </p>
                </aside>
            </div>
        </Canvas>
    );
}

function CompactToolbarDemo() {
    const [icon, setIcon] = useState('bell');

    return (
        <Canvas
            title="2 · Compact toolbar"
            badge='mode="dialog" · compact'
            caption="Icon-only footprint for toolbars — opens a dialog so the row stays intact."
        >
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                <span className="mr-auto text-sm text-muted-foreground">
                    Notifications
                </span>
                <LucideIconPicker
                    id="toolbar-icon"
                    mode="dialog"
                    value={icon}
                    onChange={setIcon}
                    triggerVariant="compact"
                    density="compact"
                    closeOnSelect
                    showCategories={false}
                />
                <Button type="button" size="sm" variant="outline">
                    Save
                </Button>
            </div>
        </Canvas>
    );
}

function DialogStudioDemo() {
    const [icon, setIcon] = useState('sparkles');

    return (
        <Canvas
            title="3 · Dialog studio"
            badge='mode="dialog" · confirm'
            caption="Button trigger opens a studio modal with preview rail and Use icon confirm."
        >
            <div className="flex flex-wrap items-center gap-4">
                <LucideIconPicker
                    id="dialog-icon"
                    mode="dialog"
                    triggerVariant="button"
                    value={icon}
                    onChange={setIcon}
                    dialogTitle="Icon studio"
                    dialogDescription="Filter by category or search, then confirm."
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon icon={icon} className="size-4" />
                    <span className="font-mono text-xs">{icon}</span>
                </div>
            </div>
        </Canvas>
    );
}

function SheetDemo() {
    const [icon, setIcon] = useState('map');

    return (
        <Canvas
            title="4 · Sheet drawer"
            badge='mode="sheet"'
            caption="Side drawer with bottom preview bar — better for mobile and narrow layouts."
        >
            <LucideIconPicker
                id="sheet-icon"
                mode="sheet"
                triggerVariant="field"
                value={icon}
                onChange={setIcon}
                description={icon}
                dialogTitle="Pick an icon"
                dialogDescription="Slide-over picker with confirm."
                className="max-w-md"
            />
        </Canvas>
    );
}

function DenseCloseDemo() {
    const [icon, setIcon] = useState('settings');

    return (
        <Canvas
            title="5 · Dense + close on select"
            badge="compact density"
            caption="Tight grid and auto-collapse after pick for dense admin forms."
        >
            <div className="max-w-lg">
                <LucideIconPicker
                    id="dense-icon"
                    value={icon}
                    onChange={setIcon}
                    density="compact"
                    closeOnSelect
                    clearSearchOnSelect
                    description={`Selected: ${icon}`}
                />
            </div>
        </Canvas>
    );
}

function CuratedDemo() {
    const [icon, setIcon] = useState('book-open');

    return (
        <Canvas
            title="6 · Curated allow-list"
            badge="allowedIcons"
            caption="Limit the catalog to a product-specific set."
        >
            <div className="max-w-lg">
                <LucideIconPicker
                    id="curated-icon"
                    value={icon}
                    onChange={setIcon}
                    allowedIcons={CURATED_ICONS}
                    showSparkles
                    description="LMS navigation icons"
                />
            </div>
        </Canvas>
    );
}

function ThemedClassNamesDemo() {
    const [elevated, setElevated] = useState('layers');
    const [minimal, setMinimal] = useState('pen-line');
    const [tint, setTint] = useState('palette');

    return (
        <Canvas
            title="7 · Themed classNames"
            badge="slot styling · dialog"
            caption="Three skins via classNames — each opens a dialog so triggers stay side-by-side without overlapping panels."
        >
            <div className="grid gap-6 md:grid-cols-3">
                <LucideIconPicker
                    id="skin-elevated"
                    mode="dialog"
                    value={elevated}
                    onChange={setElevated}
                    triggerVariant="field"
                    description={elevated}
                    classNames={{
                        trigger:
                            'border-transparent bg-background shadow-md hover:shadow-lg',
                        dialogContent: 'bg-background',
                        grid: 'border-transparent bg-muted/20',
                    }}
                />
                <LucideIconPicker
                    id="skin-minimal"
                    mode="dialog"
                    value={minimal}
                    onChange={setMinimal}
                    triggerVariant="ghost"
                    description={minimal}
                    classNames={{
                        trigger: 'px-0 hover:bg-transparent',
                        shell: 'border-b border-border pb-2',
                    }}
                />
                <LucideIconPicker
                    id="skin-tint"
                    mode="dialog"
                    value={tint}
                    onChange={setTint}
                    description={tint}
                    classNames={{
                        trigger:
                            'border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
                        optionSelected:
                            'border-emerald-500/40 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
                        optionPending:
                            'border-emerald-500/50 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
                    }}
                />
            </div>
        </Canvas>
    );
}

function ImperativeRefDemo() {
    const [icon, setIcon] = useState('folder');
    const pickerRef = useRef<LucideIconPickerHandle>(null);

    return (
        <Canvas
            title="8 · Imperative handle"
            badge="ref.open / close"
            caption="Drive dialog open, close, clear search, and focus from outside."
        >
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
                        Focus
                    </Button>
                </div>
                <LucideIconPicker
                    ref={pickerRef}
                    id="imperative-icon"
                    mode="dialog"
                    triggerVariant="button"
                    value={icon}
                    onChange={setIcon}
                />
            </div>
        </Canvas>
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

            <div className="flex h-full flex-1 flex-col gap-10 overflow-x-auto p-4 md:p-8">
                <Heading
                    title="Icon picker demo"
                    description="Calm Studio LucideIconPicker — field/compact/button triggers, dialog & sheet studios, categories, recents, and density."
                />

                <SaveDemo
                    icon={icon}
                    selectedIcon={selectedIcon}
                    setSelectedIcon={setSelectedIcon}
                />
                <Separator />
                <CompactToolbarDemo />
                <Separator />
                <DialogStudioDemo />
                <Separator />
                <SheetDemo />
                <Separator />
                <DenseCloseDemo />
                <Separator />
                <CuratedDemo />
                <Separator />
                <ThemedClassNamesDemo />
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
