import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Loader2, Lock, Save } from 'lucide-react';
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
import type { PlanOption } from '@/types/admin';

interface OrganizationFormDefaults {
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    status: string;
    plan_id: number | null;
    monthly_price: string | number | null;
    trial_days: number | null;
}

interface OrganizationFormProps {
    action: UrlMethodPair;
    isEdit?: boolean;
    planOptions: PlanOption[];
    regionOptions: { value: string; label: string }[];
    statusOptions: { value: string; label: string }[];
    defaults?: OrganizationFormDefaults;
    onCancel?: () => void;
}

/** Radix selects reject empty string values, so "no plan" needs a sentinel. */
const NO_PLAN = '__none__';

/** Stripe's ceiling for `trial_period_days`, mirrored from the Subscription model. */
const TRIAL_DAYS_MAX = 730;

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const FIELD_CLASS =
    'border-navy-100 focus-visible:border-aqua-400 focus-visible:ring-aqua-200/50';

export function OrganizationForm({
    action,
    isEdit = false,
    planOptions,
    regionOptions,
    statusOptions,
    defaults,
    onCancel,
}: OrganizationFormProps) {
    const form = useForm(action, {
        name: defaults?.name ?? '',
        slug: defaults?.slug ?? '',
        email: defaults?.email ?? '',
        phone: defaults?.phone ?? '',
        address: defaults?.address ?? '',
        region: defaults?.region ?? '',
        status: defaults?.status ?? 'active',
        plan_id: defaults?.plan_id ?? null,
        monthly_price: String(defaults?.monthly_price ?? ''),
        trial_days: String(defaults?.trial_days ?? 0),
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({ preserveScroll: true });
    };

    const plan =
        planOptions.find((option) => option.id === form.data.plan_id) ?? null;
    const hasPlan = plan !== null;
    const isCustomPriced = plan?.pricing_type === 'custom';

    /**
     * Switching plan adopts that plan's terms: a fixed plan's rate is copied in
     * and locked, a custom plan clears the field so it can be quoted, and both
     * inherit the plan's default trial length.
     */
    const choosePlan = (value: string) => {
        if (value === NO_PLAN) {
            form.setData('plan_id', null);
            form.setData('monthly_price', '');
            form.setData('trial_days', '0');

            return;
        }

        const next = planOptions.find((option) => option.value === value);

        if (!next) {
            return;
        }

        form.setData('plan_id', next.id);
        form.setData(
            'monthly_price',
            next.monthly_price === null ? '' : String(next.monthly_price),
        );
        form.setData('trial_days', String(next.trial_days));
    };

    const selectedPlan = plan?.value ?? NO_PLAN;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-5">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Organization details
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        The swim school this account belongs to.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Organization name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            onBlur={() => form.validate('name')}
                            aria-invalid={form.invalid('name')}
                            placeholder="e.g. Blue Wave Swim Academy"
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
                                'blue-wave-swim-academy'
                            }
                            className={`font-mono ${FIELD_CLASS}`}
                        />
                        <p className="text-xs text-navy-300">
                            Derived from the name when left blank. Used in the
                            organization&apos;s dashboard URL.
                        </p>
                        <InputError message={form.errors.slug} />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            onBlur={() => form.validate('email')}
                            aria-invalid={form.invalid('email')}
                            placeholder="office@bluewave-swim.test"
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                            id="phone"
                            value={form.data.phone}
                            onChange={(event) =>
                                form.setData('phone', event.target.value)
                            }
                            onBlur={() => form.validate('phone')}
                            aria-invalid={form.invalid('phone')}
                            placeholder="+1 (206) 555-0110"
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.phone} />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                            onBlur={() => form.validate('address')}
                            aria-invalid={form.invalid('address')}
                            placeholder="Street, city"
                            className={FIELD_CLASS}
                        />
                        <InputError message={form.errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                            id="region"
                            value={form.data.region}
                            onChange={(event) =>
                                form.setData('region', event.target.value)
                            }
                            onBlur={() => form.validate('region')}
                            aria-invalid={form.invalid('region')}
                            placeholder="North America"
                            list="organization-regions"
                            className={FIELD_CLASS}
                        />
                        <datalist id="organization-regions">
                            {regionOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                />
                            ))}
                        </datalist>
                        <p className="text-xs text-navy-300">
                            Shown under the name in the Organizations list.
                        </p>
                        <InputError message={form.errors.region} />
                    </div>
                </div>

                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="status">Account status</Label>
                    <Select
                        value={form.data.status}
                        onValueChange={(value) => form.setData('status', value)}
                    >
                        <SelectTrigger
                            id="status"
                            className={`w-full ${FIELD_CLASS}`}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-navy-300">
                        Suspended organizations are locked out of their
                        dashboard. Only active ones count toward platform MRR.
                    </p>
                    <InputError message={form.errors.status} />
                </div>
            </section>

            <section className="space-y-5 border-t border-navy-50 pt-6">
                <div>
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Subscription
                    </h2>
                    <p className="mt-0.5 text-body-4 text-navy-300">
                        Optional. Clearing the plan removes the subscription
                        entirely.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="plan_id">Plan</Label>
                        <Select value={selectedPlan} onValueChange={choosePlan}>
                            <SelectTrigger
                                id="plan_id"
                                className={`w-full ${FIELD_CLASS}`}
                            >
                                <SelectValue placeholder="No plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_PLAN}>No plan</SelectItem>
                                {planOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        <span className="flex items-center gap-2">
                                            {option.label}
                                            <span className="text-xs text-navy-300">
                                                {option.price_label}
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.plan_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="monthly_price">
                            Monthly rate
                            {hasPlan && !isCustomPriced && (
                                <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-400">
                                    <Lock className="size-3" />
                                    Fixed
                                </span>
                            )}
                        </Label>
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
                            // A fixed plan's rate is the same for everyone on it,
                            // so it is read-only here and the server ignores any
                            // amount posted anyway.
                            readOnly={hasPlan && !isCustomPriced}
                            disabled={!hasPlan}
                            placeholder={isCustomPriced ? '990.00' : ''}
                            className={
                                hasPlan && !isCustomPriced
                                    ? `bg-navy-50/60 text-navy-400 ${FIELD_CLASS}`
                                    : FIELD_CLASS
                            }
                        />
                        <p className="text-xs text-navy-300">
                            {!hasPlan
                                ? 'Choose a plan to set the rate.'
                                : isCustomPriced
                                  ? 'This plan is quoted per organization — enter the agreed amount.'
                                  : "Set by the plan and the same for every organization on it. Edit the plan to change it."}
                        </p>
                        <InputError message={form.errors.monthly_price} />
                    </div>
                </div>

                <div className="grid gap-2 sm:max-w-xs">
                    <Label htmlFor="trial_days">Free trial</Label>
                    <div className="relative">
                        <Input
                            id="trial_days"
                            type="number"
                            step="1"
                            min="0"
                            max={TRIAL_DAYS_MAX}
                            value={form.data.trial_days}
                            onChange={(event) =>
                                form.setData('trial_days', event.target.value)
                            }
                            onBlur={() => form.validate('trial_days')}
                            aria-invalid={form.invalid('trial_days')}
                            disabled={!hasPlan}
                            className={`pr-14 ${FIELD_CLASS}`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-navy-300">
                            days
                        </span>
                    </div>
                    <p className="text-xs text-navy-300">
                        0–{TRIAL_DAYS_MAX} days. Billing and the renewal date are
                        calculated from when the trial ends.
                    </p>
                    <InputError message={form.errors.trial_days} />
                </div>
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
                    {isEdit ? 'Save changes' : 'Create organization'}
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
