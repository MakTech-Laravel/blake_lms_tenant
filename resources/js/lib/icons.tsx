import type { LucideProps } from 'lucide-react';
import { iconNames } from 'lucide-react/dynamic';
import { createElement, useEffect, useMemo } from 'react';

import { CachedLucideIcon } from '@/components/icons/cached-lucide-icon';
import { preloadLucideIcon } from '@/lib/lucide-icon-cache';
import {
    ICON_KEYS,
    ICON_OPTIONS
    
} from '@/lib/icon-catalog';
import type {IconKey} from '@/lib/icon-catalog';

export { ICON_OPTIONS, type IconKey };

const VALID_LUCIDE_KEYS = new Set<string>(iconNames);
const DEFAULT_ICON_KEY = 'pen-line';

const ICON_LABELS = new Map<string, string>(
    ICON_OPTIONS.map((option) => [option.key, option.label]),
);

const ICON_ALIASES: Record<string, string> = {
    funnel: 'filter',
};

function normalizeIconKey(value: string): string {
    return ICON_ALIASES[value] ?? value;
}

export function isIconKey(
    value: string | null | undefined,
): value is IconKey {
    return Boolean(value && ICON_KEYS.has(value));
}

export function isValidLucideIconKey(value: string | null | undefined): boolean {
    return Boolean(value && VALID_LUCIDE_KEYS.has(value));
}

export function resolveIconKey(value: string | null | undefined): string {
    if (!value) {
        return DEFAULT_ICON_KEY;
    }

    const normalized = normalizeIconKey(value);

    if (ICON_KEYS.has(normalized) || VALID_LUCIDE_KEYS.has(normalized)) {
        return normalized;
    }

    return DEFAULT_ICON_KEY;
}

export function getIconLabel(key: string): string {
    return (
        ICON_LABELS.get(key) ??
        key
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
    );
}

export function Icon({
    icon,
    className,
    ...props
}: {
    icon?: string | null;
    className?: string;
} & Omit<LucideProps, 'ref'>) {
    const name = useMemo(() => resolveIconKey(icon), [icon]);

    useEffect(() => {
        void preloadLucideIcon(name);
    }, [name]);

    return (
        <CachedLucideIcon
            name={name}
            className={className}
            aria-hidden={props['aria-hidden'] ?? true}
            {...props}
        />
    );
}

/** @deprecated Use <Icon /> for lazy-loaded icons. */
export function getIcon(icon?: string | null) {
    const name = resolveIconKey(icon);

    return function IconComponent(props: LucideProps) {
        return createElement(Icon, { icon: name, ...props });
    };
}
