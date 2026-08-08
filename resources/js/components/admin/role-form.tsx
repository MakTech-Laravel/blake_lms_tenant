import type { UrlMethodPair } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Loader2, ShieldAlert, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { PermissionSelector } from '@/components/admin/permission-selector';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PermissionOption } from '@/types/admin';

interface RoleFormProps {
    action: UrlMethodPair;
    permissions: PermissionOption[];
    isEdit?: boolean;
    locked?: boolean;
    defaults?: { name: string; permissions: string[] };
    onCancel?: () => void;
}

export function RoleForm({
    action,
    permissions,
    isEdit = false,
    locked = false,
    defaults,
    onCancel,
}: RoleFormProps) {
    const form = useForm(action, {
        name: defaults?.name ?? '',
        permissions: defaults?.permissions ?? [],
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

    return (
        <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {locked && (
                <Alert className="border-navy-100 bg-aqua-50/40">
                    <ShieldAlert className="h-4 w-4 text-aqua-700" />
                    <AlertTitle className="text-navy-500">
                        Super Admin role
                    </AlertTitle>
                    <AlertDescription className="text-navy-400">
                        This role implicitly receives every permission via
                        <code className="mx-1 rounded bg-navy-50 px-1 py-0.5 text-xs text-navy-500">
                            Gate::before
                        </code>
                        , so it cannot be renamed or edited.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-2 sm:max-w-md">
                <Label htmlFor="name" className="text-navy-500">
                    Role name
                </Label>
                <Input
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    onBlur={() => form.validate('name')}
                    aria-invalid={form.invalid('name')}
                    placeholder="e.g. content-manager"
                    className="border-navy-100"
                    disabled={locked}
                />
                <InputError message={form.errors.name} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-navy-500">Permissions</Label>
                        <p className="text-xs text-navy-300">
                            Toggle individual permissions or whole groups at
                            once.
                        </p>
                    </div>
                    {form.validating && (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-navy-50 text-navy-500"
                        >
                            <Loader2 className="h-3 w-3 animate-spin" />{' '}
                            Validating…
                        </Badge>
                    )}
                </div>

                <PermissionSelector
                    permissions={permissions}
                    selected={form.data.permissions}
                    onChange={(next) => form.setData('permissions', next)}
                    disabled={locked}
                />
                <InputError message={form.errors.permissions} />
            </div>

            <div className="flex items-center gap-3 border-t border-navy-50 pt-5">
                <Button
                    type="submit"
                    className="bg-navy-500 text-white hover:bg-navy-600"
                    disabled={form.processing || locked}
                >
                    {form.processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create role'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        className="border-navy-100 text-navy-400"
                        onClick={onCancel}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </motion.form>
    );
}
