import { Icon } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    getCachedLucideIconNode,
    preloadLucideIcon,
} from '@/lib/lucide-icon-cache';
import { cn } from '@/lib/utils';

export function CachedLucideIcon({
    name,
    className,
    fallbackClassName,
    ...props
}: {
    name: string;
    className?: string;
    fallbackClassName?: string;
} & Omit<LucideProps, 'ref'>) {
    const [iconNode, setIconNode] = useState(() =>
        getCachedLucideIconNode(name),
    );

    useEffect(() => {
        const cached = getCachedLucideIconNode(name);

        if (cached) {
            setIconNode(cached);

            return;
        }

        let cancelled = false;

        void preloadLucideIcon(name).then((node) => {
            if (!cancelled && node) {
                setIconNode(node);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [name]);

    if (!iconNode) {
        return (
            <span
                className={cn(
                    'inline-block animate-pulse rounded-sm bg-muted/50',
                    fallbackClassName ?? className,
                )}
                aria-hidden
            />
        );
    }

    return (
        <Icon
            iconNode={iconNode}
            className={className}
            aria-hidden={props['aria-hidden'] ?? true}
            {...props}
        />
    );
}
