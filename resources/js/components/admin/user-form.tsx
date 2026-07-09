import type { UrlMethodPair } from '@inertiajs/core';
import { useForm, usePage } from '@inertiajs/react';
import { Loader2, Lock, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import FileUpload from '@/components/file-upload';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { avatarUrl, SUPER_ADMIN_ROLE } from '@/types/admin';
import type { RoleRef } from '@/types/admin';

interface UserFormDefaults {
    name: string;
    email: string;
    roles: string[];
}

interface UserFormProps {
    action: UrlMethodPair;
    roles: RoleRef[];
    isEdit?: boolean;
    currentAvatar?: string | null;
    /** The target is the only remaining super-admin — its role is locked. */
    isLastSuperAdmin?: boolean;
    defaults?: UserFormDefaults;
    onCancel?: () => void;
}

export function UserForm({
    action,
    roles,
    isEdit = false,
    currentAvatar = null,
    isLastSuperAdmin = false,
    defaults,
    onCancel,
}: UserFormProps) {
    const actorIsSuperAdmin =
        usePage().props.auth.user?.is_super_admin ?? false;

    const form = useForm(action, {
        name: defaults?.name ?? '',
        email: defaults?.email ?? '',
        password: '',
        roles: defaults?.roles ?? [],
        avatar: null as File | null,
        remove_avatar: false as boolean,
    });

    // Only a super-admin may see/assign the protected super-admin role.
    const selectableRoles = actorIsSuperAdmin
        ? roles
        : roles.filter((r) => r.name !== SUPER_ADMIN_ROLE);

    const toggleRole = (name: string) => {
        const hasRole = form.data.roles.includes(name);

        // Block removing the super-admin role from the last super-admin.
        if (name === SUPER_ADMIN_ROLE && hasRole && isLastSuperAdmin) {
            toast.error(
                'Assign the super-admin role to another user before removing it from the last super administrator.',
            );

            return;
        }

        form.setData(
            'roles',
            hasRole
                ? form.data.roles.filter((r) => r !== name)
                : [...form.data.roles, name],
        );
    };

    const existingAvatar =
        isEdit && currentAvatar && !form.data.avatar && !form.data.remove_avatar
            ? [
                  {
                      id: 'current',
                      path: currentAvatar,
                      url: avatarUrl(currentAvatar) ?? '',
                      mime_type: 'image/*',
                  },
              ]
            : [];

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
            {isLastSuperAdmin && (
                <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Last super administrator</AlertTitle>
                    <AlertDescription>
                        This is the only account with the super-admin role. To
                        change it, first assign the super-admin role to another
                        user.
                    </AlertDescription>
                </Alert>
            )}

            {/* Avatar — powered by the shared FileUpload component */}
            <div className="grid gap-2">
                <Label>Profile photo</Label>
                <FileUpload
                    accept="image/*"
                    maxSize={2}
                    value={form.data.avatar}
                    onChange={(file) => {
                        form.setData('avatar', (file as File | null) ?? null);
                        form.setData('remove_avatar', false);
                    }}
                    existingFiles={existingAvatar}
                    onRemoveExisting={() => form.setData('remove_avatar', true)}
                    placeholder="Drag & drop an avatar, or click to browse"
                    hint="PNG, JPG or WEBP"
                    error={form.errors.avatar}
                    classNames={{ wrapper: 'sm:max-w-md' }}
                />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        onBlur={() => form.validate('name')}
                        aria-invalid={form.invalid('name')}
                        placeholder="Jane Doe"
                        autoComplete="name"
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        onBlur={() => form.validate('email')}
                        aria-invalid={form.invalid('email')}
                        placeholder="jane@example.com"
                        autoComplete="email"
                    />
                    <InputError message={form.errors.email} />
                </div>
            </div>

            <div className="grid gap-2 sm:max-w-sm">
                <Label htmlFor="password">
                    Password
                    {isEdit && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                            (leave blank to keep current)
                        </span>
                    )}
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    onBlur={() => form.validate('password')}
                    aria-invalid={form.invalid('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                <InputError message={form.errors.password} />
            </div>

            {/* Roles */}
            <div className="grid gap-2">
                <Label>Roles</Label>
                <p className="text-xs text-muted-foreground">
                    Assign one or more roles. Permissions are inherited from the
                    selected roles.
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                    {selectableRoles.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                            No roles available.
                        </span>
                    )}
                    {selectableRoles.map((role) => {
                        const checked = form.data.roles.includes(role.name);
                        const isProtected = role.name === SUPER_ADMIN_ROLE;
                        const locked =
                            isProtected && isLastSuperAdmin && checked;

                        return (
                            <Label
                                key={role.id}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                                    checked
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'hover:bg-muted',
                                    locked && 'cursor-not-allowed',
                                )}
                            >
                                <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                        toggleRole(role.name)
                                    }
                                    className="size-3.5"
                                />
                                {role.name}
                                {locked && (
                                    <Lock className="h-3 w-3 opacity-70" />
                                )}
                            </Label>
                        );
                    })}
                </div>
                <InputError message={form.errors.roles} />
            </div>

            <div className="flex items-center gap-3 border-t pt-5">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    {isEdit ? 'Save changes' : 'Create user'}
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
