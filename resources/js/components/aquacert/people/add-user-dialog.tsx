import { useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, GraduationCap, Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type {
    DirectoryRoleOption,
    DirectorySchoolOption,
    DirectorySchoolRoleOption,
    PeopleAudience,
} from '@/components/aquacert/people/types';
import { storeUrlForAudience } from '@/components/aquacert/people/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import { cn } from '@/lib/utils';

type AddUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialAudience?: PeopleAudience | null;
    schools: DirectorySchoolOption[];
    roles: DirectoryRoleOption[];
    schoolRoles?: DirectorySchoolRoleOption[];
    canAssignPlatformSuperAdmin?: boolean;
};

const TYPE_OPTIONS: {
    value: PeopleAudience;
    title: string;
    description: string;
    icon: typeof GraduationCap;
}[] = [
    {
        value: 'teacher',
        title: 'Teacher',
        description: 'Instructor account linked to an organization.',
        icon: GraduationCap,
    },
    {
        value: 'school',
        title: 'Organization user',
        description: 'School staff with an organization and role.',
        icon: Building2,
    },
    {
        value: 'platform',
        title: 'Platform user',
        description: 'AquaCert staff with a platform role.',
        icon: Shield,
    },
];

export function AddUserDialog({
    open,
    onOpenChange,
    initialAudience = null,
    schools,
    roles,
    schoolRoles = [],
    canAssignPlatformSuperAdmin = false,
}: AddUserDialogProps) {
    const [step, setStep] = useState<'type' | 'form'>('type');
    const [audience, setAudience] = useState<PeopleAudience | null>(null);

    const platformRoleOptions = useMemo(
        () =>
            roles.filter(
                (role) =>
                    role.name !== 'super-admin' || canAssignPlatformSuperAdmin,
            ),
        [roles, canAssignPlatformSuperAdmin],
    );

    const form = useForm({
        name: '',
        email: '',
        password: '',
        school_id: schools[0]?.id ? String(schools[0].id) : '',
        branch_id: '',
        roles: [] as string[],
    });

    const orgRolesForSchool = useMemo(
        () =>
            schoolRoles.filter(
                (role) => String(role.school_id) === form.data.school_id,
            ),
        [schoolRoles, form.data.school_id],
    );

    useEffect(() => {
        if (!open) {
            setStep('type');
            setAudience(null);
            form.reset();
            form.clearErrors();

            return;
        }

        if (initialAudience) {
            setAudience(initialAudience);
            setStep('form');
            seedRolesForAudience(initialAudience);
        } else {
            setStep('type');
            setAudience(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog opens
    }, [open]);

    const seedRolesForAudience = (next: PeopleAudience) => {
        if (next === 'platform') {
            const first = platformRoleOptions[0]?.name;

            form.setData('roles', first ? [first] : []);

            return;
        }

        if (next === 'school') {
            const schoolId = schools[0]?.id ? String(schools[0].id) : '';
            const first = schoolRoles.find(
                (role) =>
                    String(role.school_id) === schoolId &&
                    role.name !== 'super-admin',
            )?.name;

            form.setData({
                ...form.data,
                school_id: schoolId,
                roles: first ? [first] : [],
            });
        }
    };

    const selectType = (next: PeopleAudience) => {
        setAudience(next);
        seedRolesForAudience(next);
        setStep('form');
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (!audience) {
            return;
        }

        const storeUrl = storeUrlForAudience(audience);

        // Each audience posts to a different endpoint with its own shape, so the
        // payload is narrowed before submitting rather than sending every field
        // and letting validation reject the ones that do not apply.
        if (audience === 'teacher') {
            form.transform((data) => ({
                name: data.name,
                email: data.email,
                password: data.password,
                school_id: Number(data.school_id),
                branch_id: data.branch_id ? Number(data.branch_id) : null,
            }));
        } else if (audience === 'school') {
            form.transform((data) => ({
                name: data.name,
                email: data.email,
                password: data.password,
                school_id: Number(data.school_id),
                branch_id: data.branch_id ? Number(data.branch_id) : null,
                roles: data.roles,
            }));
        } else {
            form.transform((data) => ({
                name: data.name,
                email: data.email,
                password: data.password,
                roles: data.roles,
            }));
        }

        form.post(storeUrl, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const title =
        step === 'type'
            ? 'Add User'
            : audience === 'teacher'
              ? 'Add Teacher'
              : audience === 'school'
                ? 'Add Organization User'
                : 'Add Platform User';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-navy-500">{title}</DialogTitle>
                </DialogHeader>

                {step === 'type' ? (
                    <div className="grid gap-3">
                        <p className="text-body-3 text-navy-300">
                            Choose the type of user you want to create.
                        </p>
                        {TYPE_OPTIONS.map((option) => {
                            const Icon = option.icon;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => selectType(option.value)}
                                    className={cn(
                                        'flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4 text-left transition',
                                        'hover:border-aqua-400 hover:bg-aqua-50/40',
                                    )}
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-aqua-50 text-aqua-700">
                                        <Icon className="size-5" />
                                    </span>
                                    <span>
                                        <span className="block font-semibold text-navy-500">
                                            {option.title}
                                        </span>
                                        <span className="mt-0.5 block text-body-4 text-navy-300">
                                            {option.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-body-4 text-aqua-700 hover:underline"
                            onClick={() => {
                                setStep('type');
                                form.clearErrors();
                            }}
                        >
                            <ArrowLeft className="size-3.5" />
                            Change type
                        </button>

                        <div className="grid gap-2">
                            <Label htmlFor="people-name">Full Name</Label>
                            <Input
                                id="people-name"
                                placeholder="Jane Doe"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                            {form.errors.name && (
                                <p className="text-body-4 text-red-600">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="people-email">Email</Label>
                            <Input
                                id="people-email"
                                type="email"
                                placeholder="jane@school.com"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                            />
                            {form.errors.email && (
                                <p className="text-body-4 text-red-600">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="people-password">Password</Label>
                            <Input
                                id="people-password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData(
                                        'password',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.password && (
                                <p className="text-body-4 text-red-600">
                                    {form.errors.password}
                                </p>
                            )}
                        </div>

                        {audience === 'teacher' && (
                            <div className="grid gap-2">
                                <Label>Organization</Label>
                                <Select
                                    value={form.data.school_id}
                                    onValueChange={(value) =>
                                        form.setData('school_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select school" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schools.map((school) => (
                                            <SelectItem
                                                key={school.id}
                                                value={String(school.id)}
                                            >
                                                {school.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.school_id && (
                                    <p className="text-body-4 text-red-600">
                                        {form.errors.school_id}
                                    </p>
                                )}
                                <p className="text-body-4 text-navy-300">
                                    Role is fixed as Instructor for teachers.
                                </p>
                            </div>
                        )}

                        {audience === 'school' && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Organization</Label>
                                    <Select
                                        value={form.data.school_id}
                                        onValueChange={(value) => {
                                            const first = schoolRoles.find(
                                                (role) =>
                                                    String(role.school_id) ===
                                                        value &&
                                                    role.name !== 'super-admin',
                                            )?.name;

                                            form.setData({
                                                ...form.data,
                                                school_id: value,
                                                roles: first ? [first] : [],
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select school" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schools.map((school) => (
                                                <SelectItem
                                                    key={school.id}
                                                    value={String(school.id)}
                                                >
                                                    {school.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.school_id && (
                                        <p className="text-body-4 text-red-600">
                                            {form.errors.school_id}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={form.data.roles[0] ?? ''}
                                        onValueChange={(value) =>
                                            form.setData('roles', [value])
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgRolesForSchool.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.name}
                                                >
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.roles && (
                                        <p className="text-body-4 text-red-600">
                                            {form.errors.roles}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {audience === 'platform' && (
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select
                                    value={form.data.roles[0] ?? ''}
                                    onValueChange={(value) =>
                                        form.setData('roles', [value])
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {platformRoleOptions.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.roles && (
                                    <p className="text-body-4 text-red-600">
                                        {form.errors.roles}
                                    </p>
                                )}
                                <p className="text-body-4 text-navy-300">
                                    Organization: AquaCert. Only one platform
                                    super-admin is allowed.
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-navy-500 text-white hover:bg-navy-600"
                                disabled={form.processing}
                            >
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
