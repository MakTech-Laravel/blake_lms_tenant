import { SectionCard } from '@/components/aquacert/section-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ActivityItem } from '@/data/aquacert-fixtures';

type ActivityFeedProps = {
    items: ActivityItem[];
    title?: string;
};

export function ActivityFeed({
    items,
    title = 'Recent Activity',
}: ActivityFeedProps) {
    return (
        <SectionCard
            title={title}
            action={
                <Button variant="link" className="h-auto p-0 text-aqua-600">
                    View All
                </Button>
            }
        >
            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                        {item.initials && (
                            <Avatar className="size-9">
                                <AvatarFallback className="bg-aqua-50 text-label-3 font-semibold text-aqua-700">
                                    {item.initials}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-label-2 font-medium text-navy-500">
                                {item.title}
                            </p>
                            {item.description && (
                                <p className="text-body-4 text-navy-300">
                                    {item.description}
                                </p>
                            )}
                            <p className="mt-0.5 text-caption-1 text-navy-200">
                                {item.time}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
}
