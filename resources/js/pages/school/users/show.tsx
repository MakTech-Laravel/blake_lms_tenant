import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Pencil, ShieldCheck } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permissions';
import { useTenant } from '@/hooks/use-tenant';
import users from '@/routes/school/users';
import { avatarUrl } from '@/types/admin';
import type { AdminUserDetail } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

export default function ShowUser({ user }: { user: AdminUserDetail }) {
    const { can } = usePermission();
    const { slug } = useTenant();
    const url = avatarUrl(user.avatar);

    return (
        <>
            <Head title={user.name} />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader
                    title={user.name}
                    description={user.email}
                    icon={ShieldCheck}
                >
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={users.index(slug).url}>
                                <ArrowLeft className="h-4 w-4" /> Back to staff
                            </Link>
                        </Button>
                        {can(PERMISSIONS.SCHOOL_STAFF.EDIT) && (
                            <Button asChild>
                                <Link href={users.edit([slug, user.id]).url}>
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </AdminPageHeader>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-secondary text-2xl font-semibold text-secondary-foreground">
                                {url ? (
                                    <img
                                        src={url}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold">Roles</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {user.roles.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                        No roles assigned.
                                    </span>
                                ) : (
                                    user.roles.map((r) => (
                                        <Badge
                                            key={r.id}
                                            variant="secondary"
                                            className="capitalize"
                                        >
                                            {r.name}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold">
                                Effective permissions
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {user.permissions.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                        No direct permissions.
                                    </span>
                                ) : (
                                    user.permissions.map((p) => (
                                        <Badge
                                            key={p.id}
                                            variant="outline"
                                            className="font-mono text-xs"
                                        >
                                            {p.name}
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
