import { Link, router } from '@inertiajs/react';
import { Ban, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type {
    DirectoryPerson,
    PeopleTypeFilter,
} from '@/components/aquacert/people/types';
import { StatusBadge } from '@/components/aquacert/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/types/permissions';

type PeopleTableProps = {
    people: DirectoryPerson[];
    typeFilter: PeopleTypeFilter;
    statusUrl: (id: number) => string;
    destroyUrl: (id: number) => string;
    showUrl: (id: number) => string;
    onEdit: (person: DirectoryPerson) => void;
};

export function PeopleTable({
    people,
    typeFilter,
    statusUrl,
    destroyUrl,
    showUrl,
    onEdit,
}: PeopleTableProps) {
    const { can } = usePermission();
    const [selected, setSelected] = useState<number[]>([]);
    const showOrganization = typeFilter === 'all' || typeFilter === 'school';
    const showType = typeFilter === 'all';
    const showRole = typeFilter !== 'all';

    const toggleAll = (checked: boolean) => {
        setSelected(checked ? people.map((person) => person.id) : []);
    };

    const toggleOne = (id: number, checked: boolean) => {
        setSelected((current) =>
            checked
                ? [...current, id]
                : current.filter((value) => value !== id),
        );
    };

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-navy-50 bg-aqua-50/50 hover:bg-aqua-50/50">
                        <TableHead className="w-10">
                            <Checkbox
                                checked={
                                    people.length > 0 &&
                                    selected.length === people.length
                                }
                                onCheckedChange={(value) =>
                                    toggleAll(value === true)
                                }
                                aria-label="Select all"
                            />
                        </TableHead>
                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                            User
                        </TableHead>
                        {showOrganization && (
                            <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                Organization
                            </TableHead>
                        )}
                        {showType && (
                            <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                Type
                            </TableHead>
                        )}
                        {showRole && (
                            <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                                Role
                            </TableHead>
                        )}
                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                            Status
                        </TableHead>
                        <TableHead className="text-caption-1 font-semibold tracking-wide text-aqua-700 uppercase">
                            Last Login
                        </TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {people.map((person) => (
                        <TableRow key={person.id} className="border-navy-50">
                            <TableCell>
                                <Checkbox
                                    checked={selected.includes(person.id)}
                                    onCheckedChange={(value) =>
                                        toggleOne(person.id, value === true)
                                    }
                                    aria-label={`Select ${person.name}`}
                                />
                            </TableCell>
                            <TableCell>
                                <Link
                                    href={showUrl(person.id)}
                                    className="flex items-center gap-3 text-left"
                                >
                                    <Avatar className="size-9 bg-aqua-50">
                                        {person.avatar_url ? (
                                            <AvatarImage
                                                src={person.avatar_url}
                                                alt={person.name}
                                            />
                                        ) : null}
                                        <AvatarFallback className="bg-aqua-50 text-caption-1 font-semibold text-aqua-700">
                                            {person.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>
                                        <span className="block font-semibold text-navy-500">
                                            {person.name}
                                        </span>
                                        <span className="block text-body-4 text-navy-300">
                                            {person.email}
                                        </span>
                                    </span>
                                </Link>
                            </TableCell>
                            {showOrganization && (
                                <TableCell className="text-body-3 text-navy-500">
                                    {person.organization}
                                </TableCell>
                            )}
                            {showType && (
                                <TableCell className="text-body-3 font-medium text-aqua-600">
                                    {person.user_type_label}
                                </TableCell>
                            )}
                            {showRole && (
                                <TableCell className="text-body-3 font-medium text-aqua-600">
                                    {person.role}
                                </TableCell>
                            )}
                            <TableCell>
                                <StatusBadge status={person.status} />
                            </TableCell>
                            <TableCell className="text-body-3 text-navy-400">
                                {person.last_login_label}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-navy-400"
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={showUrl(person.id)}>
                                                <Eye className="size-4" />
                                                View
                                            </Link>
                                        </DropdownMenuItem>
                                        {can(PERMISSIONS.USERS.EDIT) && (
                                            <DropdownMenuItem
                                                onClick={() => onEdit(person)}
                                            >
                                                <Pencil className="size-4" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {can(PERMISSIONS.USERS.EDIT) &&
                                            person.status !== 'Disabled' && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.patch(
                                                            statusUrl(
                                                                person.id,
                                                            ),
                                                            {
                                                                status: 'disabled',
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Ban className="size-4" />
                                                    Disable
                                                </DropdownMenuItem>
                                            )}
                                        {can(PERMISSIONS.USERS.EDIT) &&
                                            person.status === 'Disabled' && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.patch(
                                                            statusUrl(
                                                                person.id,
                                                            ),
                                                            {
                                                                status: 'active',
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Ban className="size-4" />
                                                    Enable
                                                </DropdownMenuItem>
                                            )}
                                        {can(PERMISSIONS.USERS.DELETE) &&
                                            person.can_delete && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete ${person.name}?`,
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    destroyUrl(
                                                                        person.id,
                                                                    ),
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
