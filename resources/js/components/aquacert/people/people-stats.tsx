import { Bolt, CircleSlash, UserCheck, Users } from 'lucide-react';
import { AquaStatCard } from '@/components/aquacert/aqua-stat-card';
import type { DirectoryStats } from '@/components/aquacert/people/types';

type PeopleStatsProps = {
    stats: DirectoryStats;
};

export function PeopleStats({ stats }: PeopleStatsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AquaStatCard
                label="Total Users"
                value={stats.total}
                icon={Users}
            />
            <AquaStatCard
                label="Active"
                value={stats.active}
                icon={UserCheck}
                className="[&_span]:bg-emerald-50 [&_span]:text-emerald-600"
            />
            <AquaStatCard
                label="Pending"
                value={stats.pending}
                icon={Bolt}
                className="[&_span]:bg-amber-50 [&_span]:text-amber-600"
            />
            <AquaStatCard
                label="Disabled"
                value={stats.disabled}
                icon={CircleSlash}
                className="[&_span]:bg-red-50 [&_span]:text-red-600"
            />
        </div>
    );
}
