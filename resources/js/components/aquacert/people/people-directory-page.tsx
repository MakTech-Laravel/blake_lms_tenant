import { Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    Download,
    FileSpreadsheet,
    FileText,
    Filter,
    Plus,
    Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { exportPeople } from '@/actions/App/Http/Controllers/Platform/UserController';
import { DataPagination } from '@/components/admin/data-pagination';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AddUserDialog } from '@/components/aquacert/people/add-user-dialog';
import { PeopleStats } from '@/components/aquacert/people/people-stats';
import { PeopleTable } from '@/components/aquacert/people/people-table';
import type {
    DirectoryFilterRoleOption,
    DirectoryPerson,
    DirectoryRoleOption,
    DirectorySchoolOption,
    DirectorySchoolRoleOption,
    DirectoryStats,
    PeopleDirectoryFilters,
    PeopleTypeFilter,
} from '@/components/aquacert/people/types';
import { PEOPLE_TYPE_TABS } from '@/components/aquacert/people/types';
import { UserDetailsDialog } from '@/components/aquacert/people/user-details-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permissions';
import type { Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type PeopleDirectoryPageProps = {
    title: string;
    people: Paginated<DirectoryPerson>;
    stats: DirectoryStats;
    filters: PeopleDirectoryFilters;
    schools?: DirectorySchoolOption[];
    roles?: DirectoryRoleOption[];
    schoolRoles?: DirectorySchoolRoleOption[];
    filterRoles?: DirectoryFilterRoleOption[];
    canAssignPlatformSuperAdmin?: boolean;
    indexUrl: string;
    statusUrl: (id: number) => string;
    destroyUrl: (id: number) => string;
};

type AdvancedFilters = {
    status: string;
    organization: string;
    role: string;
    last_login: string;
};

function queryPayload(
    typeFilter: PeopleTypeFilter,
    search: string,
    advanced: AdvancedFilters,
) {
    return {
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: search || undefined,
        status: advanced.status || undefined,
        organization: advanced.organization || undefined,
        role: advanced.role || undefined,
        last_login: advanced.last_login || undefined,
    };
}

export function PeopleDirectoryPage({
    title,
    people,
    stats,
    filters,
    schools = [],
    roles = [],
    schoolRoles = [],
    filterRoles = [],
    canAssignPlatformSuperAdmin = false,
    indexUrl,
    statusUrl,
    destroyUrl,
}: PeopleDirectoryPageProps) {
    const { can } = usePermission();
    const typeFilter = filters.type ?? 'all';

    const [search, setSearch] = useState(filters.search ?? '');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<AdvancedFilters>({
        status: filters.status ?? '',
        organization: filters.organization ?? '',
        role: filters.role ?? '',
        last_login: filters.last_login ?? '',
    });
    const [addOpen, setAddOpen] = useState(false);
    const [detailsPerson, setDetailsPerson] = useState<DirectoryPerson | null>(
        null,
    );
    const firstRender = useRef(true);

    const activeFilters: AdvancedFilters = useMemo(
        () => ({
            status: filters.status ?? '',
            organization: filters.organization ?? '',
            role: filters.role ?? '',
            last_login: filters.last_login ?? '',
        }),
        [filters.status, filters.organization, filters.role, filters.last_login],
    );

    const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        setDraftFilters(activeFilters);
    }, [activeFilters]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(indexUrl, queryPayload(typeFilter, search, activeFilters), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timeout);
        // Advanced filters are applied explicitly; only debounce search + tab.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- activeFilters applied via Apply
    }, [search, indexUrl, typeFilter]);

    const visitWithType = (type: PeopleTypeFilter) => {
        router.get(indexUrl, queryPayload(type, search, activeFilters), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyFilters = () => {
        router.get(indexUrl, queryPayload(typeFilter, search, draftFilters), {
            preserveState: true,
            preserveScroll: true,
        });
        setFiltersOpen(false);
    };

    const clearFilters = () => {
        const empty = {
            status: '',
            organization: '',
            role: '',
            last_login: '',
        };
        setDraftFilters(empty);
        router.get(indexUrl, queryPayload(typeFilter, search, empty), {
            preserveState: true,
            preserveScroll: true,
        });
        setFiltersOpen(false);
    };

    const exportHref = (format: 'csv' | 'xlsx', scope: 'all' | 'visible') =>
        exportPeople.url({
            query: {
                ...queryPayload(typeFilter, search, activeFilters),
                format,
                scope,
                ids:
                    scope === 'visible'
                        ? people.data.map((person) => person.id)
                        : undefined,
            },
        });

    const handleEdit = (person: DirectoryPerson) => {
        if (person.edit_url) {
            router.visit(person.edit_url);

            return;
        }

        setDetailsPerson(person);
        setAddOpen(false);
    };

    return (
        <>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-6 bg-[#f8fafc] p-4 md:p-6">
                <AquaPageHeader
                    title={title}
                    subtitle={`${stats.total} users across the platform`}
                    actions={
                        can(PERMISSIONS.USERS.CREATE) ? (
                            <Button
                                type="button"
                                className="bg-navy-500 text-white hover:bg-navy-600"
                                onClick={() => setAddOpen(true)}
                            >
                                <Plus className="size-4" />
                                Add User
                            </Button>
                        ) : null
                    }
                />

                <PeopleStats stats={stats} />

                <Tabs
                    value={typeFilter}
                    onValueChange={(value) =>
                        visitWithType(value as PeopleTypeFilter)
                    }
                >
                    <TabsList className="h-auto flex-wrap bg-navy-50/60 p-1">
                        {PEOPLE_TYPE_TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="data-[state=active]:bg-white data-[state=active]:text-navy-500"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <Card className="border-navy-50 bg-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-sm flex-1">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search users..."
                                className="border-navy-100 pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-navy-100 text-navy-400"
                                    >
                                        <Filter className="size-4" />
                                        Filters
                                        {activeFilterCount > 0 ? (
                                            <span className="ml-1 rounded-full bg-aqua-100 px-1.5 text-caption-1 font-semibold text-aqua-700">
                                                {activeFilterCount}
                                            </span>
                                        ) : null}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    className="w-80 space-y-4 border-navy-100 p-4"
                                >
                                    <div>
                                        <p className="font-semibold text-navy-500">
                                            Filters
                                        </p>
                                        <p className="text-body-4 text-navy-300">
                                            Narrow the directory by status,
                                            organization, role, or recent login.
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={draftFilters.status || 'all'}
                                            onValueChange={(value) =>
                                                setDraftFilters((current) => ({
                                                    ...current,
                                                    status:
                                                        value === 'all'
                                                            ? ''
                                                            : value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Any status
                                                </SelectItem>
                                                <SelectItem value="active">
                                                    Active
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="disabled">
                                                    Disabled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Organization</Label>
                                        <Select
                                            value={
                                                draftFilters.organization || 'all'
                                            }
                                            onValueChange={(value) =>
                                                setDraftFilters((current) => ({
                                                    ...current,
                                                    organization:
                                                        value === 'all'
                                                            ? ''
                                                            : value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any organization" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Any organization
                                                </SelectItem>
                                                <SelectItem value="aquacert">
                                                    AquaCert
                                                </SelectItem>
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
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={draftFilters.role || 'all'}
                                            onValueChange={(value) =>
                                                setDraftFilters((current) => ({
                                                    ...current,
                                                    role:
                                                        value === 'all'
                                                            ? ''
                                                            : value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Any role
                                                </SelectItem>
                                                {filterRoles.map((role) => (
                                                    <SelectItem
                                                        key={role.value}
                                                        value={role.value}
                                                    >
                                                        {role.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Last login</Label>
                                        <Select
                                            value={
                                                draftFilters.last_login || 'all'
                                            }
                                            onValueChange={(value) =>
                                                setDraftFilters((current) => ({
                                                    ...current,
                                                    last_login:
                                                        value === 'all'
                                                            ? ''
                                                            : value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    Any time
                                                </SelectItem>
                                                <SelectItem value="never">
                                                    Never logged in
                                                </SelectItem>
                                                <SelectItem value="week">
                                                    Last 7 days
                                                </SelectItem>
                                                <SelectItem value="month">
                                                    Last 30 days
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-between gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-navy-400"
                                            onClick={clearFilters}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            type="button"
                                            className="bg-navy-500 text-white hover:bg-navy-600"
                                            onClick={applyFilters}
                                        >
                                            Apply filters
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {can(PERMISSIONS.USERS.EXPORT) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-navy-100 text-navy-400"
                                        >
                                            <Download className="size-4" />
                                            Export
                                            <ChevronDown className="size-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                All matching
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem asChild>
                                                    <a href={exportHref('csv', 'all')}>
                                                        <FileText className="size-4" />
                                                        CSV
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a
                                                        href={exportHref(
                                                            'xlsx',
                                                            'all',
                                                        )}
                                                    >
                                                        <FileSpreadsheet className="size-4" />
                                                        Excel
                                                    </a>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                Only visible
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem asChild>
                                                    <a
                                                        href={exportHref(
                                                            'csv',
                                                            'visible',
                                                        )}
                                                    >
                                                        <FileText className="size-4" />
                                                        CSV
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <a
                                                        href={exportHref(
                                                            'xlsx',
                                                            'visible',
                                                        )}
                                                    >
                                                        <FileSpreadsheet className="size-4" />
                                                        Excel
                                                    </a>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <PeopleTable
                            people={people.data}
                            typeFilter={typeFilter}
                            statusUrl={statusUrl}
                            destroyUrl={destroyUrl}
                            onView={setDetailsPerson}
                            onEdit={handleEdit}
                        />
                    </div>

                    <div className="mt-4">
                        <DataPagination meta={people} />
                    </div>
                </Card>
            </div>

            <AddUserDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                schools={schools}
                roles={roles}
                schoolRoles={schoolRoles}
                canAssignPlatformSuperAdmin={canAssignPlatformSuperAdmin}
            />

            <UserDetailsDialog
                open={detailsPerson !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailsPerson(null);
                    }
                }}
                person={detailsPerson}
                onEdit={
                    detailsPerson?.edit_url
                        ? () => handleEdit(detailsPerson)
                        : undefined
                }
            />
        </>
    );
}
