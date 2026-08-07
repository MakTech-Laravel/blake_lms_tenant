import { Pencil } from 'lucide-react';
import { StatusBadge } from '@/components/aquacert/status-badge';
import type { DirectoryPerson } from '@/components/aquacert/people/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type UserDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    person: DirectoryPerson | null;
    onEdit?: () => void;
};

export function UserDetailsDialog({
    open,
    onOpenChange,
    person,
    onEdit,
}: UserDetailsDialogProps) {
    if (!person) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-navy-500">User Details</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-4">
                    <Avatar className="size-14 bg-aqua-50 text-aqua-700">
                        {person.avatar_url ? (
                            <AvatarImage src={person.avatar_url} alt={person.name} />
                        ) : null}
                        <AvatarFallback className="bg-aqua-50 font-semibold text-aqua-700">
                            {person.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-h6 font-semibold text-navy-500">{person.name}</p>
                        <p className="text-body-3 text-navy-300">{person.email}</p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                        { label: 'Organization', value: person.organization },
                        { label: 'Role', value: person.role },
                        { label: 'Location', value: person.location },
                        { label: 'Last Login', value: person.last_login_label },
                    ].map((field) => (
                        <div
                            key={field.label}
                            className="rounded-lg border border-navy-50 bg-navy-50/40 p-3"
                        >
                            <p className="text-caption-1 font-semibold tracking-wide text-aqua-600 uppercase">
                                {field.label}
                            </p>
                            <p className="mt-1 text-body-2 font-medium text-navy-500">
                                {field.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <span className="text-body-3 text-navy-300">Status:</span>
                    <StatusBadge status={person.status} />
                </div>

                <DialogFooter>
                    {onEdit ? (
                        <Button
                            type="button"
                            className="bg-navy-500 text-white hover:bg-navy-600"
                            onClick={onEdit}
                        >
                            <Pencil className="size-4" />
                            Edit User
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
