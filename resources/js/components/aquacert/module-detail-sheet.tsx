import type { ReactNode } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type ModuleDetailSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
};

export function ModuleDetailSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
}: ModuleDetailSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="text-navy-500">{title}</SheetTitle>
                    {description ? (
                        <SheetDescription className="text-navy-300">
                            {description}
                        </SheetDescription>
                    ) : null}
                </SheetHeader>
                <div className="mt-6 space-y-4 px-1">{children}</div>
                {footer ? (
                    <div className="mt-8 border-t border-navy-50 pt-4">
                        {footer}
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
