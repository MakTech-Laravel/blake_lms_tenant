import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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

interface PlanFormDefaults {
    name: string;
    slug: string;
    pricing_type: string;
    monthly_price: string | number | null;
    annual_price: string | number | null;
    description: string | null;
    staff_limit: number | null;
    location_limit: number | null;
    course_limit: number | null;
    storage_gb: number | null;
    features: string[];
    is_popular: boolean;
    trial_days: number;
    sort_order: number;
    is_active: boolean;
}

interface PlanFormProps {
    action: UrlMethodPair;
    isEdit?: boolean;
    pricingOptions: { value: string; label: string }[];
    trialDaysMax: number;
    defaults?: PlanFormDefaults;
    /** Organizations already on this plan, so edits can warn about the blast radius. */
    subscriptionsCount?: number;
    onCancel?: () => void;
}

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const FIELD_CLASS =
    'border-navy-100 focus-visible:border-aqua-400 focus-visible:ring-aqua-200/50';

/** A NULL limit means unlimited, which the form represents as a blank field. */
const numberField = (value: number | null | undefined): string =>
    value === null || value === undefined ? '' : String(value);

const LIMIT_FIELDS = [
    {
        key: 'staff_limit',
        label: 'Staff accounts',
        placeholder: '25',
    },
    {
        key: 'location_limit',
        label: 'Locations',
        placeholder: '5',
    },
    {
        key: 'course_limit',
        label: 'Active courses',
        placeholder: '10',
    },
    {
        key: 'storage_gb',
        label: 'Storage (GB)',
        placeholder: '250',
    },
] as const;

export function PlanForm({
    action,
    isEdit = false,
    pricingOptions,
    trialDaysMax,
    defaults,
    subscriptionsCount = 0,
    onCancel,
}: PlanFormProps) {
    const form = useForm(action, {
        name: defaults?.name ?? '',
        slug: defaults?.slug ?? '',
        pricing_type: defaults?.pricing_type ?? 'fixed',
        monthly_price: String(defaults?.monthly_price ?? ''),
        annual_price: String(defaults?.annual_price ?? ''),
        description: defaults?.description ?? '',
        staff_limit: numberField(defaults?.staff_limit),
        location_limit: numberField(defaults?.location_limit),
        course_limit: numberField(defaults?.course_limit),
        storage_gb: numberField(defaults?.storage_gb),
        // Authored as one feature per line, which is how the card reads it back.
        features: (defaults?.features ?? []).join('\n'),
        is_popular: defaults?.is_popular ?? false,
        trial_days: String(defaults?.trial_days ?? 14),
        sort_order: String(defaults?.sort_order ?? 0),
        is_active: defaults?.is_active ?? true,
    });

    const isCustomPriced = form.data.pricing_type === 'custom';

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({ preserveScroll: true });
    };

    /** Custom-priced plans hold no rate, so switching to one clears both fields. */
    const choosePricing = (value: string) => {
        form.setData('pricing_type', value);

        if (value === 'custom') {
            form.setData('monthly_price', '');
            form.setData('annual_price', '');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-5">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Plan details
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        How this tier appears when assigning it to an
                        organization.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Plan name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            onBlur={() => form.validate('name')}
                            aria-invalid={form.invalid('name')}
                            placeholder="e.g. LMS + Training Content"
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">
                            Slug
                            <span className="ml-1 text-xs font-normal text-navy-300">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="slug"
                            value={form.data.slug}
                            onChange={(event) =>
                                form.setData('slug', event.target.value)
                            }
                            onBlur={() => form.validate('slug')}
                            aria-invalid={form.invalid('slug')}
                            placeholder={
                                slugify(form.data.name) ||
                                'lms-training-content'
                            }
                            className={`font-mono ${FIELD_CLASS}`}
                        />
                        <p className="text-xs text-navy-300">
                            Derived from the name when left blank.
                        </p>
                        <InputError message={form.errors.slug} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">
                        Description
                        <span className="ml-1 text-xs font-normal text-navy-300">
                            (optional)
                        </span>
                    </Label>
                    <Textarea
                        id="description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        onBlur={() => form.validate('description')}
                        aria-invalid={form.invalid('description')}
                        placeholder="What this tier includes."
                        rows={2}
                        className={FIELD_CLASS}
                    />
                    <InputError message={form.errors.description} />
                </div>
            </section>

            <section className="space-y-5 border-t border-navy-50 pt-6">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Pricing
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        A fixed rate applies to every organization on the plan. A
                        custom rate is quoted per organization instead.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="pricing_type">Pricing type</Label>
                        <Select
                            value={form.data.pricing_type}
                            onValueChange={choosePricing}
                        >
                            <SelectTrigger
                                id="pricing_type"
                                className={`w-full ${FIELD_CLASS}`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pricingOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.pricing_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="monthly_price">Monthly rate</Label>
                        <Input
                            id="monthly_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.monthly_price}
                            onChange={(event) =>
                                form.setData('monthly_price', event.target.value)
                            }
                            onBlur={() => form.validate('monthly_price')}
                            aria-invalid={form.invalid('monthly_price')}
                            disabled={isCustomPriced}
                            placeholder={isCustomPriced ? 'Quoted per deal' : '990.00'}
                            className={FIELD_CLASS}
                        />
                        <p className="text-xs text-navy-300">
                            {isCustomPriced
                                ? 'Custom plans carry no list price — the rate is entered per organization.'
                                : 'Locked for every organization on this plan.'}
                        </p>
                        <InputError message={form.errors.monthly_price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="annual_price">
                            Annual rate
                            <span className="ml-1 text-xs font-normal text-navy-300">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="annual_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.annual_price}
                            onChange={(event) =>
                                form.setData('annual_price', event.target.value)
                            }
                            onBlur={() => form.validate('annual_price')}
                            aria-invalid={form.invalid('annual_price')}
                            disabled={isCustomPriced}
                            placeholder={
                                isCustomPriced ? 'Quoted per deal' : '9900.00'
                            }
                            className={FIELD_CLASS}
                        />
                        <p className="text-xs text-navy-300">
                            Shown on the plan card. Leave blank to offer monthly
                            billing only.
                        </p>
                        <InputError message={form.errors.annual_price} />
                    </div>
                </div>

                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="trial_days">Default free trial</Label>
                    <div className="relative">
                        <Input
                            id="trial_days"
                            type="number"
                            step="1"
                            min="0"
                            max={trialDaysMax}
                            value={form.data.trial_days}
                            onChange={(event) =>
                                form.setData('trial_days', event.target.value)
                            }
                            onBlur={() => form.validate('trial_days')}
                            aria-invalid={form.invalid('trial_days')}
                            className={`pr-14 ${FIELD_CLASS}`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-navy-300">
                            days
                        </span>
                    </div>
                    <p className="text-xs text-navy-300">
                        0–{trialDaysMax} days, prefilled when the plan is
                        assigned and adjustable per organization.
                    </p>
                    <InputError message={form.errors.trial_days} />
                </div>
            </section>

            <section className="space-y-5 border-t border-navy-50 pt-6">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Limits
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        Leave a field blank for unlimited. Shown on the plan card
                        as a guide; not enforced yet.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {LIMIT_FIELDS.map((field) => (
                        <div key={field.key} className="grid gap-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                                id={field.key}
                                type="number"
                                step="1"
                                min="0"
                                value={form.data[field.key]}
                                onChange={(event) =>
                                    form.setData(field.key, event.target.value)
                                }
                                onBlur={() => form.validate(field.key)}
                                aria-invalid={form.invalid(field.key)}
                                placeholder={field.placeholder}
                                className={FIELD_CLASS}
                            />
                            <p className="text-xs text-navy-300">
                                {form.data[field.key] === ''
                                    ? 'Unlimited'
                                    : '\u00a0'}
                            </p>
                            <InputError message={form.errors[field.key]} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-5 border-t border-navy-50 pt-6">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Features
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        One per line. These become the checklist on the plan
                        card, in the order written.
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="features" className="sr-only">
                        Features
                    </Label>
                    <Textarea
                        id="features"
                        value={form.data.features}
                        onChange={(event) =>
                            form.setData('features', event.target.value)
                        }
                        onBlur={() => form.validate('features')}
                        aria-invalid={form.invalid('features')}
                        placeholder={
                            'Core LMS and course delivery\nCustom branded certificates\nPriority email support'
                        }
                        rows={8}
                        className={FIELD_CLASS}
                    />
                    <InputError message={form.errors.features} />
                </div>
            </section>

            <section className="space-y-5 border-t border-navy-50 pt-6">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Availability
                    </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2 sm:max-w-[10rem]">
                        <Label htmlFor="sort_order">Display order</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            step="1"
                            min="0"
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                            onBlur={() => form.validate('sort_order')}
                            aria-invalid={form.invalid('sort_order')}
                            className={FIELD_CLASS}
                        />
                        <p className="text-xs text-navy-300">
                            Lower numbers list first.
                        </p>
                        <InputError message={form.errors.sort_order} />
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-navy-50 bg-navy-50/40 p-4">
                        <Switch
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked)
                            }
                            className="mt-0.5 data-[state=checked]:bg-aqua-500"
                        />
                        <div className="grid gap-1">
                            <Label
                                htmlFor="is_active"
                                className="text-navy-500"
                            >
                                Available to assign
                            </Label>
                            <p className="text-xs text-navy-300">
                                Turn this off to keep the plan for existing
                                organizations without offering it to new ones.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-navy-50 bg-navy-50/40 p-4">
                    <Switch
                        id="is_popular"
                        checked={form.data.is_popular}
                        onCheckedChange={(checked) =>
                            form.setData('is_popular', checked)
                        }
                        className="mt-0.5 data-[state=checked]:bg-aqua-500"
                    />
                    <div className="grid gap-1">
                        <Label htmlFor="is_popular" className="text-navy-500">
                            Highlight as most popular
                        </Label>
                        <p className="text-xs text-navy-300">
                            Only one plan can carry the ribbon, so turning this
                            on removes it from whichever plan holds it today.
                        </p>
                    </div>
                </div>

                {isEdit && subscriptionsCount > 0 && (
                    <p className="rounded-lg border border-orange-200 bg-orange-50/60 p-3 text-body-4 text-orange-700">
                        {subscriptionsCount} organization
                        {subscriptionsCount === 1 ? ' is' : 's are'} on this
                        plan. Changing a fixed rate here changes what they are
                        billed.
                    </p>
                )}
            </section>

            <div className="flex items-center gap-3 border-t border-navy-50 pt-6">
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="bg-navy-500 text-white hover:bg-navy-600"
                >
                    {form.processing ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create plan'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.processing}
                        className="border-navy-100 text-navy-400"
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
