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
import { useEffect, useRef, useState } from 'react';
import { exportPeople } from '@/actions/App/Http/Controllers/Platform/UserController';
import { DataPagination } from '@/components/admin/data-pagination';
import { AquaPageHeader } from '@/components/aquacert/aqua-page-header';
import { AddUserDialog } from '@/components/aquacert/people/add-user-dialog';
import { PeopleStats } from '@/components/aquacert/people/people-stats';
import { PeopleTable } from '@/components/aquacert/people/people-table';
import type {
    DirectoryPerson,
    DirectoryRoleOption,
    DirectorySchoolOption,
    DirectoryStats,
    PeopleTypeFilter,
} from '@/components/aquacert/people/types';
import {
    PEOPLE_TYPE_TABS,
    audienceFromTypeFilter,
    storeUrlForAudience,
} from '@/components/aquacert/people/types';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permissions';
import type { Paginated } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

type PeopleDirectoryPageProps = {
    title: string;
    people: Paginated<DirectoryPerson>;
    stats: DirectoryStats;
    filters: { search: string; type: PeopleTypeFilter };
    schools?: DirectorySchoolOption[];
    roles?: DirectoryRoleOption[];
    indexUrl: string;
    statusUrl: (id: number) => string;
    destroyUrl: (id: number) => string;
};

export function PeopleDirectoryPage({
    title,
    people,
    stats,
    filters,
    schools = [],
    roles = [],
    indexUrl,
    statusUrl,
    destroyUrl,
}: PeopleDirectoryPageProps) {
    const { can } = usePermission();
    const typeFilter = filters.type ?? 'all';
    const audience = audienceFromTypeFilter(typeFilter);
    const storeUrl = storeUrlForAudience(audience);

    const [search, setSearch] = useState(filters.search ?? '');
    const [addOpen, setAddOpen] = useState(false);
    const [detailsPerson, setDetailsPerson] = useState<DirectoryPerson | null>(
        null,
    );
    const firstRender = useRef(true);

    useEffect(() => {
        setSearch(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                indexUrl,
                {
                    type: typeFilter === 'all' ? undefined : typeFilter,
                    search: search || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, indexUrl, typeFilter]);

    const visitWithType = (type: PeopleTypeFilter) => {
        router.get(
            indexUrl,
            {
                type: type === 'all' ? undefined : type,
                search: search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const exportHref = (
        format: 'csv' | 'xlsx',
        scope: 'all' | 'visible',
    ) =>
        exportPeople.url({
            query: {
                format,
                scope,
                type: typeFilter === 'all' ? undefined : typeFilter,
                search: search || undefined,
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
                            <Button
                                type="button"
                                variant="outline"
                                className="border-navy-100 text-navy-400"
                            >
                                <Filter className="size-4" />
                                Filters
                            </Button>
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
                audience={audience}
                storeUrl={storeUrl}
                schools={schools}
                roles={roles}
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
