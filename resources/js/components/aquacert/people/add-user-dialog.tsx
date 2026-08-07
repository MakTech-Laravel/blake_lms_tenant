import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type {
    DirectoryRoleOption,
    DirectorySchoolOption,
    PeopleAudience,
} from '@/components/aquacert/people/types';
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

type AddUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    audience: PeopleAudience;
    storeUrl: string;
    schools: DirectorySchoolOption[];
    roles: DirectoryRoleOption[];
};

export function AddUserDialog({
    open,
    onOpenChange,
    audience,
    storeUrl,
    schools,
    roles,
}: AddUserDialogProps) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        school_id: schools[0]?.id ? String(schools[0].id) : '',
        branch_id: '',
        roles: roles[0]?.name ? [roles[0].name] : ([] as string[]),
    });

    const needsOrganization = audience === 'teacher' || audience === 'school';

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (needsOrganization) {
            form
                .transform((data) => ({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    school_id: Number(data.school_id),
                    branch_id: data.branch_id ? Number(data.branch_id) : null,
                }))
                .post(storeUrl, {
                    preserveScroll: true,
                    onSuccess: () => {
                        form.reset();
                        onOpenChange(false);
                    },
                });

            return;
        }

        form
            .transform((data) => ({
                name: data.name,
                email: data.email,
                password: data.password,
                roles: data.roles,
            }))
            .post(storeUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                },
            });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-navy-500">Add User</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
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
                            <p className="text-body-4 text-red-600">{form.errors.name}</p>
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
                            <p className="text-body-4 text-red-600">{form.errors.email}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="people-password">Password</Label>
                        <Input
                            id="people-password"
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                        />
                        {form.errors.password && (
                            <p className="text-body-4 text-red-600">
                                {form.errors.password}
                            </p>
                        )}
                    </div>

                    {needsOrganization ? (
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
                                {audience === 'teacher'
                                    ? 'Role is fixed as Instructor for teachers.'
                                    : 'Creates a school staff account for the selected organization.'}
                            </p>
                        </div>
                    ) : (
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
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
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
                                Organization: AquaCert
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
            </DialogContent>
        </Dialog>
    );
}
