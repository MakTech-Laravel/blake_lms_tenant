import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    IdCard,
    KeyRound,
    Mail,
    Pencil,
    ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permissions';
import { dashboard } from '@/routes/platform';
import users from '@/routes/platform/users';
import { avatarUrl } from '@/types/admin';
import type { AdminUserDetail } from '@/types/admin';
import { PERMISSIONS } from '@/types/permissions';

export default function ShowUser({ user }: { user: AdminUserDetail }) {
    const { can } = usePermission();
    const url = avatarUrl(user.avatar);

    return (
        <>
            <Head title={user.name} />

            <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <AdminPageHeader title="User profile" icon={IdCard}>
                    <Button variant="outline" asChild>
                        <Link href={users.index().url}>
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                    </Button>
                    {can(PERMISSIONS.USERS.EDIT) && (
                        <Button asChild>
                            <Link href={users.edit(user.id).url}>
                                <Pencil className="h-4 w-4" /> Edit
                            </Link>
                        </Button>
                    )}
                </AdminPageHeader>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6 lg:grid-cols-3"
                >
                    {/* Identity card */}
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-1">
                        <div className="flex flex-col items-center gap-3 border-b bg-muted/40 p-6 text-center">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 text-2xl font-bold text-primary">
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
                                <h2 className="text-lg font-bold">
                                    {user.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1">
                                {user.roles.map((r) => (
                                    <Badge
                                        key={r.id}
                                        variant="secondary"
                                        className="capitalize"
                                    >
                                        {r.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <dl className="divide-y text-sm">
                            <Row
                                icon={IdCard}
                                label="User ID"
                                value={`#${user.id}`}
                            />
                            <Row icon={Mail} label="Email" value={user.email} />
                            <Row
                                icon={ShieldCheck}
                                label="Verified"
                                value={
                                    user.email_verified_at ? 'Yes' : 'Pending'
                                }
                            />
                            <Row
                                icon={Calendar}
                                label="Joined"
                                value={new Date(
                                    user.created_at,
                                ).toLocaleDateString(undefined, {
                                    dateStyle: 'long',
                                })}
                            />
                        </dl>
                    </div>

                    {/* Effective permissions */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">
                                Effective permissions
                            </h3>
                            <Badge variant="outline" className="ml-auto">
                                {user.permissions.length}
                            </Badge>
                        </div>
                        {user.permissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                This user has no direct permissions. Access is
                                granted through assigned roles.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {user.permissions.map((p) => (
                                    <Badge
                                        key={p.id}
                                        variant="secondary"
                                        className="font-mono text-xs font-normal"
                                    >
                                        {p.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}

function Row({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof IdCard;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-2 px-6 py-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4 opacity-70" /> {label}
            </dt>
            <dd className="font-medium text-foreground">{value}</dd>
        </div>
    );
}

ShowUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: users.index() },
        { title: 'Profile', href: users.index() },
    ],
};
