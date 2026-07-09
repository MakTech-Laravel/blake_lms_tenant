import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types/admin';

interface DataPaginationProps {
    meta: Pick<
        Paginated<unknown>,
        'links' | 'from' | 'to' | 'total' | 'prev_page_url' | 'next_page_url'
    >;
}

export function DataPagination({ meta }: DataPaginationProps) {
    if (meta.total === 0) {
        return null;
    }

    return (
        <div className="flex w-full flex-col items-center justify-between gap-4 border-t bg-muted/20 px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                    {meta.from ?? 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-foreground">
                    {meta.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                    {meta.total}
                </span>{' '}
                results
            </p>

            <nav className="flex items-center gap-1">
                <PageLink
                    href={meta.prev_page_url}
                    aria-label="Previous page"
                    icon
                >
                    <ChevronLeft className="h-4 w-4" />
                </PageLink>

                {meta.links.slice(1, -1).map((link, idx) =>
                    link.label === '...' ? (
                        <span
                            key={`sep-${idx}`}
                            className="px-2 text-xs text-muted-foreground"
                        >
                            …
                        </span>
                    ) : (
                        <PageLink
                            key={link.label}
                            href={link.url}
                            active={link.active}
                        >
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        </PageLink>
                    ),
                )}

                <PageLink href={meta.next_page_url} aria-label="Next page" icon>
                    <ChevronRight className="h-4 w-4" />
                </PageLink>
            </nav>
        </div>
    );
}

function PageLink({
    href,
    active = false,
    icon = false,
    children,
    ...props
}: {
    href: string | null;
    active?: boolean;
    icon?: boolean;
    children: React.ReactNode;
    'aria-label'?: string;
}) {
    const className = cn(
        'inline-flex h-8 items-center justify-center rounded-md border text-xs font-medium transition-colors',
        icon ? 'w-8' : 'min-w-8 px-2.5',
        !href && 'pointer-events-none opacity-40',
        active
            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
            : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
    );

    if (!href) {
        return (
            <span className={className} {...props}>
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            preserveScroll
            preserveState
            className={className}
            {...props}
        >
            {children}
        </Link>
    );
}
