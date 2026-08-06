import { SectionCard } from '@/components/aquacert/section-card';
import { Button } from '@/components/ui/button';
import type { QuickAction } from '@/data/aquacert-fixtures';
import { usePermission } from '@/hooks/use-permissions';

type QuickActionsProps = {
    actions: QuickAction[];
    columns?: 1 | 2 | 3;
};

export function QuickActions({ actions, columns = 2 }: QuickActionsProps) {
    const { canAny } = usePermission();

    const visible = actions.filter(
        (action) =>
            !action.permissions ||
            action.permissions.length === 0 ||
            canAny(action.permissions),
    );

    if (visible.length === 0) {
        return null;
    }

    return (
        <SectionCard title="Quick Actions">
            <div
                className={
                    columns === 1
                        ? 'grid grid-cols-1 gap-3'
                        : columns === 3
                          ? 'grid grid-cols-3 gap-3'
                          : 'grid grid-cols-2 gap-3'
                }
            >
                {visible.map((action) => (
                    <Button
                        key={action.id}
                        type="button"
                        variant="outline"
                        className="h-auto justify-center border-navy-100 px-3 py-4 text-center text-label-3 font-medium whitespace-normal text-aqua-700 hover:bg-aqua-50 hover:text-aqua-800"
                    >
                        {action.label}
                    </Button>
                ))}
            </div>
        </SectionCard>
    );
}
