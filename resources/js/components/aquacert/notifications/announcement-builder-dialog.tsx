import { useForm } from '@inertiajs/react';
import { Clock, Eye, Loader2, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AudiencePicker } from '@/components/aquacert/notifications/audience-picker';
import type { AudienceValue } from '@/components/aquacert/notifications/audience-picker';
import { NotificationIcon } from '@/components/aquacert/notifications/notification-icon';
import { StatusBadge } from '@/components/aquacert/status-badge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type {
    NotificationAudienceOption,
    NotificationListItem,
    NotificationModuleRoutes,
    SelectOption,
} from '@/types/admin';

const FIELD_CLASS =
    'border-navy-100 focus-visible:border-aqua-400 focus-visible:ring-aqua-200/50';

/** The three footer buttons, sent as `intent` so the server never has to guess. */
type Intent = 'draft' | 'schedule' | 'send';

type AnnouncementBuilderDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    routes: NotificationModuleRoutes;
    audienceOptions: NotificationAudienceOption[];
    categoryOptions: SelectOption[];
    priorityOptions: SelectOption[];
    organizationOptions: SelectOption[];
    planOptions: SelectOption[];
    roleOptions: SelectOption[];
    /** Set when editing; null when composing something new. */
    editing?: NotificationListItem | null;
};

/**
 * The announcement composer.
 *
 * Everything about one announcement lives in this one dialog rather than a
 * multi-step page, because the author's decisions are interdependent: the
 * audience changes the reach, the reach changes whether sending now is wise, and
 * the priority changes how the email presents itself. Splitting them across steps
 * would hide each from the others.
 *
 * The same dialog handles editing. A delivered announcement is never editable, so
 * the caller only ever passes drafts, scheduled, and failed ones.
 */
export function AnnouncementBuilderDialog({
    open,
    onOpenChange,
    routes,
    audienceOptions,
    categoryOptions,
    priorityOptions,
    organizationOptions,
    planOptions,
    roleOptions,
    editing = null,
}: AnnouncementBuilderDialogProps) {
    const [preview, setPreview] = useState(false);
    const [wasOpen, setWasOpen] = useState(open);

    // Adjusted during render rather than in an effect: opening the dialog must
    // never show the previous session's preview tab, and doing it here means the
    // first paint is already correct.
    if (wasOpen !== open) {
        setWasOpen(open);
        setPreview(false);
    }

    const form = useForm({
        title: '',
        body: '',
        category: categoryOptions[0]?.value ?? 'announcement',
        priority: 'normal',
        action_label: '',
        action_url: '',
        send_email: false,
        audience_type: audienceOptions[0]?.value ?? 'all_users',
        school_ids: [] as string[],
        plan_ids: [] as string[],
        role_ids: [] as string[],
        user_ids: [] as string[],
        scheduled_at: '',
        intent: 'draft' as Intent,
    });

    /**
     * Reload the form each time the dialog opens so a half-written announcement
     * from a previous open never bleeds into the next one.
     */
    useEffect(() => {
        if (!open) {
            return;
        }

        form.clearErrors();

        if (!editing) {
            form.reset();

            return;
        }

        const key = idsKeyFor(editing.audience_type, audienceOptions);
        const ids = editing.audience_ids.map(String);

        form.setDefaults({
            title: editing.title,
            body: editing.body,
            category: editing.category_value,
            priority: editing.priority_value,
            action_label: editing.action_label ?? '',
            action_url: editing.action_url ?? '',
            send_email: editing.sends_email,
            audience_type: editing.audience_type,
            school_ids: key === 'school_ids' ? ids : [],
            plan_ids: key === 'plan_ids' ? ids : [],
            role_ids: key === 'role_ids' ? ids : [],
            user_ids: key === 'user_ids' ? ids : [],
            scheduled_at: editing.scheduled_at ?? '',
            intent: editing.status_value === 'scheduled' ? 'schedule' : 'draft',
        });
        form.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the dialog opens
    }, [open, editing?.id]);

    const idsKey = idsKeyFor(form.data.audience_type, audienceOptions);

    const audienceValue: AudienceValue = {
        audience_type: form.data.audience_type,
        ids: idsKey ? (form.data[idsKey] as string[]) : [],
    };

    const changeAudience = (next: AudienceValue) => {
        const key = idsKeyFor(next.audience_type, audienceOptions);

        form.setData({
            ...form.data,
            audience_type: next.audience_type,
            school_ids: key === 'school_ids' ? next.ids : [],
            plan_ids: key === 'plan_ids' ? next.ids : [],
            role_ids: key === 'role_ids' ? next.ids : [],
            user_ids: key === 'user_ids' ? next.ids : [],
        });
    };

    const submitWith = (intent: Intent) => (event?: FormEvent) => {
        event?.preventDefault();

        // Set on the payload rather than in component state so the value the
        // server sees is always the button that was actually pressed.
        form.transform((data) => ({ ...data, intent }));

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (editing) {
            form.put(editing.update_url, options);

            return;
        }

        form.post(routes.store, options);
    };

    const canSchedule = form.data.scheduled_at !== '';
    const audienceIdsError = idsKey ? form.errors[idsKey] : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="border-b border-navy-50 px-6 py-4">
                    <DialogTitle className="text-navy-500">
                        {editing ? 'Edit Announcement' : 'Announcement Builder'}
                    </DialogTitle>
                    <DialogDescription className="text-body-4 text-navy-300">
                        {editing
                            ? 'Rewrite this announcement, or send it as it stands.'
                            : 'Compose a message, choose who receives it, and send it now or later.'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submitWith(canSchedule ? 'schedule' : 'send')}
                    className="max-h-[calc(92vh-11rem)] space-y-5 overflow-y-auto px-6 py-5"
                >
                    <div className="grid gap-1.5">
                        <Label htmlFor="announcement-title">Title</Label>
                        <Input
                            id="announcement-title"
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData('title', event.target.value)
                            }
                            placeholder="Announcement title"
                            className={FIELD_CLASS}
                            maxLength={150}
                        />
                        <InputError message={form.errors.title} />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="announcement-body">Content</Label>
                        <Textarea
                            id="announcement-body"
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                            placeholder="Write your message..."
                            rows={6}
                            className={FIELD_CLASS}
                            maxLength={5000}
                        />
                        <div className="flex items-center justify-between">
                            <InputError message={form.errors.body} />
                            <span className="text-caption-1 text-navy-200 tabular-nums">
                                {form.data.body.length}/5000
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label htmlFor="announcement-category">
                                Category
                            </Label>
                            <Select
                                value={form.data.category}
                                onValueChange={(value) =>
                                    form.setData('category', value)
                                }
                            >
                                <SelectTrigger
                                    id="announcement-category"
                                    className={`w-full ${FIELD_CLASS}`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.category} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="announcement-priority">
                                Priority
                            </Label>
                            <Select
                                value={form.data.priority}
                                onValueChange={(value) =>
                                    form.setData('priority', value)
                                }
                            >
                                <SelectTrigger
                                    id="announcement-priority"
                                    className={`w-full ${FIELD_CLASS}`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.priority} />
                        </div>
                    </div>

                    <AudiencePicker
                        options={audienceOptions}
                        value={audienceValue}
                        onChange={changeAudience}
                        organizationOptions={organizationOptions}
                        planOptions={planOptions}
                        roleOptions={roleOptions}
                        optionsUrl={routes.audience_options}
                        estimateUrl={routes.estimate}
                        error={form.errors.audience_type}
                        idsError={audienceIdsError}
                    />

                    <div className="grid gap-1.5">
                        <Label htmlFor="announcement-schedule">
                            Schedule (optional)
                        </Label>
                        <Input
                            id="announcement-schedule"
                            type="datetime-local"
                            value={form.data.scheduled_at}
                            onChange={(event) =>
                                form.setData('scheduled_at', event.target.value)
                            }
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.scheduled_at} />
                        <p className="text-body-4 text-navy-300">
                            Leave empty to send immediately.
                        </p>
                    </div>

                    <div className="grid gap-3 rounded-xl border border-navy-100 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Label
                                    htmlFor="announcement-email"
                                    className="text-navy-500"
                                >
                                    Also send by email
                                </Label>
                                <p className="mt-0.5 text-body-4 text-navy-300">
                                    Recipients always get the in-app copy. Email
                                    adds a nudge towards it.
                                </p>
                            </div>
                            <Switch
                                id="announcement-email"
                                checked={form.data.send_email}
                                onCheckedChange={(checked) =>
                                    form.setData('send_email', checked)
                                }
                            />
                        </div>

                        <div className="grid gap-3 border-t border-navy-50 pt-3 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="announcement-action-label">
                                    Button label (optional)
                                </Label>
                                <Input
                                    id="announcement-action-label"
                                    value={form.data.action_label}
                                    onChange={(event) =>
                                        form.setData(
                                            'action_label',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="View details"
                                    className={FIELD_CLASS}
                                />
                                <InputError
                                    message={form.errors.action_label}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="announcement-action-url">
                                    Button link
                                </Label>
                                <Input
                                    id="announcement-action-url"
                                    type="url"
                                    value={form.data.action_url}
                                    onChange={(event) =>
                                        form.setData(
                                            'action_url',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="https://..."
                                    className={FIELD_CLASS}
                                />
                                <InputError message={form.errors.action_url} />
                            </div>
                        </div>
                    </div>

                    {preview && (
                        <div className="rounded-xl border border-aqua-200 bg-aqua-50/40 p-4">
                            <p className="mb-3 text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                How this will look
                            </p>
                            <div className="flex gap-3 rounded-lg border border-navy-100 bg-white p-3">
                                <NotificationIcon
                                    category={form.data.category}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-navy-500">
                                            {form.data.title ||
                                                'Announcement title'}
                                        </p>
                                        {form.data.priority !== 'normal' && (
                                            <StatusBadge
                                                status={
                                                    priorityOptions.find(
                                                        (option) =>
                                                            option.value ===
                                                            form.data.priority,
                                                    )?.label ?? ''
                                                }
                                            />
                                        )}
                                    </div>
                                    <p className="mt-1 text-body-4 whitespace-pre-line text-navy-400">
                                        {form.data.body ||
                                            'Write your message...'}
                                    </p>
                                    {form.data.action_label && (
                                        <span className="mt-2 inline-flex rounded-md bg-aqua-500 px-3 py-1.5 text-caption-1 font-semibold text-white">
                                            {form.data.action_label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                <DialogFooter className="flex-wrap gap-2 border-t border-navy-50 bg-navy-50/40 px-6 py-4 sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPreview((current) => !current)}
                        className="border-navy-100 text-navy-400"
                    >
                        <Eye className="size-4" />
                        {preview ? 'Hide preview' : 'Preview'}
                    </Button>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={submitWith('draft')}
                            className="border-navy-100 text-navy-400"
                        >
                            <Save className="size-4" />
                            Save Draft
                        </Button>

                        {canSchedule ? (
                            <Button
                                type="button"
                                disabled={form.processing}
                                onClick={submitWith('schedule')}
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                {form.processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Clock className="size-4" />
                                )}
                                Schedule
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={form.processing}
                                onClick={submitWith('send')}
                                className="bg-navy-500 text-white hover:bg-navy-600"
                            >
                                {form.processing ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Send className="size-4" />
                                )}
                                Send Now
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Which payload key an audience mode's ids belong under, or null if it has none. */
function idsKeyFor(
    audienceType: string,
    options: NotificationAudienceOption[],
): 'school_ids' | 'plan_ids' | 'role_ids' | 'user_ids' | null {
    const resource = options.find((option) => option.value === audienceType)
        ?.resource;

    switch (resource) {
        case 'organizations':
            return 'school_ids';
        case 'plans':
            return 'plan_ids';
        case 'roles':
            return 'role_ids';
        case 'users':
            return 'user_ids';
        default:
            return null;
    }
}
