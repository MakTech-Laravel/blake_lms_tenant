import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DataTableToolbarProps = {
    placeholder?: string;
};

export function DataTableToolbar({
    placeholder = 'Search...',
}: DataTableToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                <Input
                    placeholder={placeholder}
                    className="border-navy-100 pl-9"
                    readOnly
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
                <Button
                    type="button"
                    variant="outline"
                    className="border-navy-100 text-navy-400"
                >
                    <Download className="size-4" />
                    Export
                </Button>
            </div>
        </div>
    );
}
