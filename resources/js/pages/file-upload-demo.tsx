/**
 * resources/js/Pages/FileUploadDemo.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * All-in-one demo for the FileUpload component.
 *
 * Demonstrates
 *  1. Single file + aggregate progress + cancel (useForm)
 *  2. Multiple files + per-file individual progress + cancel (router.post loop)
 *  3. Edit mode — existing server files + adding / removing files
 *  4. Avatar — single image, circular, rejection handling (onReject)
 *  5. Lightbox enabled vs disabled
 *  6. Custom classNames per slot
 *  7. Imperative ref (openFileBrowser / clearFiles)
 *  8. Disabled state
 */

import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import type {
    ExistingFile,
    FileProgresses,
    FileRejection,
    FileUploadHandle,
} from '@/components/file-upload';
import FileUpload, { fileProgressKey } from '@/components/file-upload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { index as fileUploadDemo } from '@/routes/file-upload-demo';
import { update as postUpdate } from '@/routes/posts'; // Wayfinder
import { store as uploadStore } from '@/routes/upload'; // Wayfinder

// ─── Inertia page props ───────────────────────────────────────────────────────

type Attachment = ExistingFile;

interface Post {
    id: number;
    title: string;
    attachments: Attachment[];
}

interface PageProps {
    flash: { success?: string; error?: string };
    demoPost: Post; // seeded record used for the "edit" demo
    [key: string]: unknown;
}

// ─── Helper: section wrapper ──────────────────────────────────────────────────

function Section({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                    {title}
                </h2>
                {badge && <Badge variant="outline">{badge}</Badge>}
            </div>
            {children}
        </section>
    );
}

// ─── 1. Single-file with aggregate progress + cancel ───────────────────────────

function SingleFileDemo() {
    const { data, setData, post, progress, processing, errors, reset, cancel } =
        useForm<{
            label: string;
            file: File | null;
        }>({ label: '', file: null });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(uploadStore().url, { onSuccess: () => reset() });
    }

    return (
        <Section
            title="1 · Single file — aggregate progress + cancel"
            badge="useForm"
        >
            <p className="text-sm text-muted-foreground">
                All files travel in one multipart POST. Inertia reports a single
                aggregate percentage — shown on the card and in the progress
                row. A Cancel control aborts the in-flight request via{' '}
                <code>form.cancel()</code>.
            </p>

            <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
                <input
                    type="text"
                    placeholder="Label"
                    value={data.label}
                    onChange={(e) => setData('label', e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />

                {/* lightbox={true} so users can zoom the preview */}
                <FileUpload
                    lightbox
                    value={data.file}
                    onChange={(f) => setData('file', f as File | null)}
                    accept="image/*,application/pdf"
                    maxSize={5}
                    isUploading={processing}
                    uploadProgress={progress?.percentage ?? null}
                    onCancel={cancel}
                    placeholder="Drop a file or click to browse"
                    hint="Image or PDF, max 5 MB"
                    error={errors.file}
                />

                <Button
                    type="submit"
                    disabled={processing || !data.file}
                    className="w-full"
                >
                    {processing
                        ? `Uploading ${Math.round(progress?.percentage ?? 0)}%…`
                        : 'Upload'}
                </Button>
            </form>
        </Section>
    );
}

// ─── 2. Multiple files — per-file individual progress + cancel ────────────────

function MultipleFilesDemo() {
    const [files, setFiles] = useState<File[] | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progresses, setProgresses] = useState<FileProgresses>({});
    // Keyed by fileProgressKey() — never bare name — so two same-named files
    // track independently. We keep the display name alongside the message.
    const [fileErrors, setFileErrors] = useState<
        Record<string, { name: string; message: string }>
    >({});

    function handleUpload() {
        if (!files?.length) {
            return;
        }

        setIsUploading(true);
        setProgresses({});
        setFileErrors({});

        let done = 0;
        const total = files.length;

        const finish = () => {
            done++;

            if (done === total) {
                setIsUploading(false);
                setFiles(null);
            }
        };

        files.forEach((file) => {
            // Stable identity → independent ring even if names repeat.
            const key = fileProgressKey(file);

            router.post(
                uploadStore().url,
                { file },
                {
                    forceFormData: true,
                    preserveState: true,
                    preserveScroll: true,
                    onProgress: (e) => {
                        setProgresses((prev) => ({
                            ...prev,
                            [key]: e?.percentage ?? 0,
                        }));
                    },
                    onSuccess: () => {
                        setProgresses((prev) => ({ ...prev, [key]: 100 }));
                        finish();
                    },
                    onError: (errs) => {
                        setFileErrors((prev) => ({
                            ...prev,
                            [key]: {
                                name: file.name,
                                message: errs.file ?? 'Upload failed',
                            },
                        }));
                        finish();
                    },
                },
            );
        });
    }

    // Cancel ALL in-flight uploads at once (v3 replaces router.cancel()).
    function handleCancel() {
        router.cancelAll();
        setIsUploading(false);
        setProgresses({});
    }

    const fileCount = files?.length ?? 0;

    return (
        <Section
            title="2 · Multiple files — per-file progress rings + cancel"
            badge="router.post loop"
        >
            <p className="text-sm text-muted-foreground">
                Each file is sent in its own Inertia request. Every card shows
                its own individual circular progress ring, with a Cancel control
                that aborts every in-flight request via{' '}
                <code>router.cancelAll()</code>.
            </p>

            {/* lightbox enabled so images / videos open full-screen */}
            <FileUpload
                multiple
                lightbox
                maxFiles={6}
                maxSize={20}
                accept="image/*,video/*"
                value={files}
                onChange={(f) => setFiles(f as File[] | null)}
                isUploading={isUploading}
                fileProgresses={progresses}
                onCancel={handleCancel}
                placeholder="Drop media here or click to browse"
                hint="Images & videos, up to 20 MB each, max 6 files"
            />

            <Button
                onClick={handleUpload}
                disabled={isUploading || fileCount === 0}
            >
                {isUploading
                    ? 'Uploading…'
                    : `Upload ${fileCount} file${fileCount !== 1 ? 's' : ''}`}
            </Button>

            {/* Show any per-file errors */}
            {Object.entries(fileErrors).map(([key, { name, message }]) => (
                <p key={key} className="text-sm text-destructive">
                    {name}: {message}
                </p>
            ))}
        </Section>
    );
}

// ─── 3. Edit mode with existing server files ──────────────────────────────────

function EditModeDemo({ post }: { post: Post }) {
    const [removedIds, setRemovedIds] = useState<(number | string)[]>([]);

    const {
        data,
        setData,
        post: submit,
        progress,
        processing,
        errors,
        cancel,
        reset,
    } = useForm<{
        title: string;
        files: File[] | null;
        remove_attachments: (number | string)[];
    }>({
        title: post.title,
        files: null,
        remove_attachments: [],
    });

    const visibleExisting = post.attachments.filter(
        (a) => !removedIds.includes(a.id),
    );

    function handleRemoveExisting(id: number | string) {
        setRemovedIds((prev) => [...prev, id]);
        setData('remove_attachments', [...data.remove_attachments, id]);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        submit(postUpdate(post.id).url, {
            // On success the page reloads `demoPost` with the just-saved files
            // included as existing attachments. Clear the local "new files" and
            // the pending removals so nothing renders twice.
            onSuccess: () => {
                reset('files', 'remove_attachments');
                setRemovedIds([]);
            },
        });
    }

    return (
        <Section
            title="3 · Edit mode — existing + new files"
            badge="server files"
        >
            <p className="text-sm text-muted-foreground">
                Existing server files are shown alongside the drop zone.
                Removing an existing file queues its ID in{' '}
                <code>remove_attachments[]</code>. New files are appended.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Post title"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />

                <FileUpload
                    multiple
                    lightbox // ← lightbox ON
                    maxFiles={10}
                    maxSize={50}
                    value={data.files}
                    onChange={(f) => setData('files', f as File[] | null)}
                    existingFiles={visibleExisting}
                    onRemoveExisting={handleRemoveExisting}
                    isUploading={processing}
                    uploadProgress={progress?.percentage ?? null}
                    onCancel={cancel}
                    error={errors.files}
                    placeholder="Add more files"
                />

                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : 'Save changes'}
                </Button>
            </form>
        </Section>
    );
}

// ─── 4. Avatar — single image, circular, rejection handling ───────────────────

function AvatarDemo() {
    const [file, setFile] = useState<File | null>(null);
    const [rejections, setRejections] = useState<FileRejection[]>([]);

    function handleReject(rejected: FileRejection[]) {
        // Surface rejections however you like — here we mirror them into a toast-ish list.
        setRejections(rejected);
    }

    return (
        <Section title="4 · Avatar — single image + onReject" badge="onReject">
            <p className="text-sm text-muted-foreground">
                A constrained, circular single-image picker. Oversize files and
                wrong types are rejected on both click <em>and</em> drag-drop,
                then reported through the <code>onReject</code> callback (no
                <code> alert()</code>).
            </p>

            <FileUpload
                value={file}
                onChange={(f) => {
                    setFile(f as File | null);
                    setRejections([]);
                }}
                accept="image/png,image/jpeg,image/webp"
                maxSize={2}
                onReject={handleReject}
                showRejections={false} // we render our own below
                classNames={{
                    wrapper: 'max-w-xs',
                    dropzone: 'rounded-full aspect-square py-0 size-44 mx-auto',
                    card: 'rounded-full size-44 mx-auto',
                    cardMedia: 'aspect-square',
                    cardInfo: 'hidden', // hide filename row for a clean avatar
                }}
                placeholder="Upload avatar"
                hint="PNG / JPG / WEBP"
            />

            {rejections.length > 0 && (
                <ul className="space-y-1 text-sm text-destructive">
                    {rejections.map((r, i) => (
                        <li key={`${r.file.name}-${i}`}>• {r.message}</li>
                    ))}
                </ul>
            )}
        </Section>
    );
}

// ─── 5. Lightbox disabled (default) ──────────────────────────────────────────

function LightboxOffDemo() {
    const [files, setFiles] = useState<File[] | null>(null);

    return (
        <Section
            title="5 · Lightbox disabled (default)"
            badge="lightbox={false}"
        >
            <p className="text-sm text-muted-foreground">
                No <code>lightbox</code> prop is passed (default{' '}
                <code>false</code>). Clicking image/video thumbnails does
                nothing — ideal for simple upload forms where a viewer is
                unnecessary.
            </p>

            <FileUpload
                multiple
                maxFiles={4}
                accept="image/*"
                value={files}
                onChange={(f) => setFiles(f as File[] | null)}
                placeholder="Select images (no lightbox)"
            />
        </Section>
    );
}

// ─── 6. Custom classNames ─────────────────────────────────────────────────────

function CustomStyleDemo() {
    const [file, setFile] = useState<File | null>(null);

    return (
        <Section title="6 · Custom classNames per slot">
            <p className="text-sm text-muted-foreground">
                Every element is overridable via the <code>classNames</code>{' '}
                prop.
            </p>

            <FileUpload
                lightbox
                value={file}
                onChange={(f) => setFile(f as File | null)}
                accept="image/*"
                classNames={{
                    wrapper: 'rounded-2xl border p-4 bg-muted/30',
                    dropzone:
                        'border-blue-400 bg-blue-50 dark:bg-blue-950/30 py-14',
                    dropzoneContent: 'text-blue-700 dark:text-blue-300',
                    card: 'rounded-2xl ring-2 ring-blue-200',
                    cardMedia: 'aspect-square', // square thumbnail
                    cardInfo: 'bg-blue-50/60 dark:bg-blue-950/40',
                    removeButton: 'h-7 w-7',
                    progressOverlay: 'bg-black/70',
                }}
                placeholder="Custom-styled zone"
                hint="Square thumbnails, blue accents"
            />
        </Section>
    );
}

// ─── 7. Imperative ref ────────────────────────────────────────────────────────

function ImperativeRefDemo() {
    const [file, setFile] = useState<File | null>(null);
    const uploadRef = useRef<FileUploadHandle>(null);

    return (
        <Section title="7 · Imperative ref — openFileBrowser / clearFiles">
            <p className="text-sm text-muted-foreground">
                Use a <code>ref</code> to trigger the OS file picker or wipe
                selections from a parent button — useful inside wizard steps or
                custom toolbars.
            </p>

            <div className="mb-3 flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => uploadRef.current?.openFileBrowser()}
                >
                    Open file browser
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => uploadRef.current?.clearFiles()}
                    disabled={!file}
                >
                    Clear selection
                </Button>
            </div>

            <FileUpload
                ref={uploadRef}
                lightbox
                value={file}
                onChange={(f) => setFile(f as File | null)}
                placeholder="Controlled by external buttons"
            />
        </Section>
    );
}

// ─── 8. Disabled state ────────────────────────────────────────────────────────

function DisabledDemo() {
    const existing: ExistingFile[] = [
        {
            id: 1,
            path: 'uploads/sample.jpg',
            url: 'https://picsum.photos/seed/demo/400/300',
            mime_type: 'image/jpeg',
            name: 'sample.jpg',
            size: 204_800,
        },
    ];

    return (
        <Section title="8 · Disabled state">
            <p className="text-sm text-muted-foreground">
                The drop zone and remove buttons are hidden/inactive. Use while
                a request is in-flight or in read-only views.
            </p>

            <FileUpload
                multiple
                disabled
                lightbox
                existingFiles={existing}
                value={null}
                onChange={() => {}}
                placeholder="Uploads are disabled"
            />
        </Section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FileUploadDemo() {
    const { flash, demoPost } = usePage<PageProps>().props;

    return (
        <>
            <Head>
                <title>File Upload Demo</title>
                <meta name="description" content="File Upload Demo" />
                <meta name="keywords" content="File Upload Demo" />
            </Head>
            <div className="flex h-full flex-col items-center justify-center bg-background p-4 py-20">
                <div className="space-y-10 rounded-xl bg-card p-8">
                    {/* Header */}
                    <header className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            FileUpload — all features demo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Laravel 13 · Inertia v3 · React · TypeScript ·
                            shadcn/ui
                        </p>
                    </header>

                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {flash.error}
                        </div>
                    )}

                    <Separator />

                    <SingleFileDemo />
                    <Separator />

                    <MultipleFilesDemo />
                    <Separator />

                    <EditModeDemo post={demoPost} />
                    <Separator />

                    <AvatarDemo />
                    <Separator />

                    <LightboxOffDemo />
                    <Separator />

                    <CustomStyleDemo />
                    <Separator />

                    <ImperativeRefDemo />
                    <Separator />

                    <DisabledDemo />
                </div>
            </div>
        </>
    );
}

FileUploadDemo.layout = {
    breadcrumbs: [
        {
            title: 'File Upload Demo',
            href: fileUploadDemo(),
        },
    ],
};
