import { Head } from '@inertiajs/react';
import {
    FileSpreadsheet,
    FileText,
    KeyRound,
    Layers,
    Search,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import permissions from '@/routes/platform/permissions';
import { groupByGroup } from '@/types/admin';
import type { PermissionListItem } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

export default function PermissionsIndex({
    permissions: items,
}: {
    permissions: PermissionListItem[];
}) {
    const { can } = usePermission();
    const [query, setQuery] = useState('');

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = q
            ? items.filter(
                  (p) =>
                      p.name.toLowerCase().includes(q) ||
                      p.group.toLowerCase().includes(q),
              )
            : items;

        return Object.entries(groupByGroup(filtered));
    }, [items, query]);

    return (
        <>
            <Head title="Permissions" />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title="Permissions"
                    description="Developer-defined permissions, grouped by domain. Read-only."
                    icon={KeyRound}
                >
                    {can(PERMISSIONS.PERMISSIONS.EXPORT) && (
                        <>
                            <Button variant="outline" asChild>
                                <a
                                    href={
                                        permissions.export({
                                            query: { format: 'csv' },
                                        }).url
                                    }
                                >
                                    <FileText className="h-4 w-4" /> CSV
                                </a>
                            </Button>
                            <Button asChild>
                                <a
                                    href={
                                        permissions.export({
                                            query: { format: 'xlsx' },
                                        }).url
                                    }
                                >
                                    <FileSpreadsheet className="h-4 w-4" />{' '}
                                    Excel
                                </a>
                            </Button>
                        </>
                    )}
                </AdminPageHeader>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search permissions…"
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="secondary" className="gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {groups.length} groups
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                        <KeyRound className="h-3.5 w-3.5" />
                        {items.length} permissions
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {groups.map(([group, perms], i) => (
                        <motion.div
                            key={group}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="overflow-hidden rounded-xl border bg-card shadow-sm"
                        >
                            <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <Layers className="h-4 w-4 text-primary" />
                                    {group}
                                </h3>
                                <Badge variant="outline">{perms.length}</Badge>
                            </div>
                            <ul className="divide-y">
                                {perms.map((perm) => (
                                    <li
                                        key={perm.id}
                                        className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted/30"
                                    >
                                        <span className="font-mono text-xs text-foreground">
                                            {perm.name}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 gap-1 text-xs"
                                            title={`Assigned to ${perm.roles_count} role(s)`}
                                        >
                                            {perm.roles_count}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    {groups.length === 0 && (
                        <div className="col-span-full rounded-xl border border-dashed py-16 text-center">
                            <KeyRound className="mx-auto h-10 w-10 text-muted-foreground/40" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                No permissions match “{query}”.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Permissions', href: permissions.index() },
    ],
};
