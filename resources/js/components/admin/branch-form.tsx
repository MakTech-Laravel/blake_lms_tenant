import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Building2, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BranchFormDefaults {
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
}

interface BranchFormProps {
    action: UrlMethodPair;
    isEdit?: boolean;
    /** Staff pinned to this branch — they lose access while it is inactive. */
    staffCount?: number;
    defaults?: BranchFormDefaults;
    onCancel?: () => void;
}

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function BranchForm({
    action,
    isEdit = false,
    staffCount = 0,
    defaults,
    onCancel,
}: BranchFormProps) {
    const form = useForm(action, {
        name: defaults?.name ?? '',
        slug: defaults?.slug ?? '',
        email: defaults?.email ?? '',
        phone: defaults?.phone ?? '',
        address: defaults?.address ?? '',
        is_active: defaults?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.submit({
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) {
                    form.reset();
                }
            },
        });
    };

    const deactivating = isEdit && !form.data.is_active && staffCount > 0;

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Branch name</Label>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        onBlur={() => form.validate('name')}
                        aria-invalid={form.invalid('name')}
                        placeholder="e.g. Rangpur"
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="slug">
                        Slug
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                            (optional)
                        </span>
                    </Label>
                    <Input
                        id="slug"
                        value={form.data.slug}
                        onChange={(e) => form.setData('slug', e.target.value)}
                        onBlur={() => form.validate('slug')}
                        aria-invalid={form.invalid('slug')}
                        placeholder={slugify(form.data.name) || 'rangpur'}
                        className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                        Derived from the name when left blank. Unique within
                        your school only — other schools may reuse it.
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
                        onChange={(e) => form.setData('email', e.target.value)}
                        onBlur={() => form.validate('email')}
                        aria-invalid={form.invalid('email')}
                        placeholder="rangpur@school.test"
                    />
                    <InputError message={form.errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                        id="phone"
                        value={form.data.phone}
                        onChange={(e) => form.setData('phone', e.target.value)}
                        onBlur={() => form.validate('phone')}
                        aria-invalid={form.invalid('phone')}
                        placeholder="+880 1700 000000"
                    />
                    <InputError message={form.errors.phone} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={form.data.address}
                    onChange={(e) => form.setData('address', e.target.value)}
                    onBlur={() => form.validate('address')}
                    aria-invalid={form.invalid('address')}
                    placeholder="Street, city"
                />
                <InputError message={form.errors.address} />
            </div>

            <div className="grid gap-2">
                <Label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
                    <Checkbox
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    Branch is active
                </Label>
                <p className="text-xs text-muted-foreground">
                    Deactivating is the safe alternative to deleting: the
                    records stay intact, but staff pinned to the branch lose
                    access.
                </p>
                <InputError message={form.errors.is_active} />
            </div>

            {deactivating && (
                <Alert>
                    <Building2 className="h-4 w-4" />
                    <AlertTitle>
                        {staffCount} staff account
                        {staffCount === 1 ? '' : 's'} pinned here
                    </AlertTitle>
                    <AlertDescription>
                        They will be locked out of the school dashboard until
                        this branch is reactivated or they are reassigned.
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex items-center gap-3 border-t pt-5">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create branch'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                )}
                {form.validating && (
                    <Badge variant="secondary" className="gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" /> Validating…
                    </Badge>
                )}
            </div>
        </motion.form>
    );
}
