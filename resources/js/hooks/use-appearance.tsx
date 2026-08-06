import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();

/**
 * The product is light-mode only. Dark and system preferences are accepted as
 * API input so existing settings UI / cookies keep working, then immediately
 * coerced to light so the `dark` class never lands on <html>.
 */
const FORCED_APPEARANCE: Appearance = 'light';

let currentAppearance: Appearance = FORCED_APPEARANCE;

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyLightTheme = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

/**
 * Persist light mode and strip any previous dark/system preference so a stale
 * cookie or localStorage value cannot reintroduce the `dark` class on reload.
 */
const forceLight = (): void => {
    currentAppearance = FORCED_APPEARANCE;
    localStorage.setItem('appearance', FORCED_APPEARANCE);
    setCookie('appearance', FORCED_APPEARANCE);
    applyLightTheme();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    forceLight();
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => FORCED_APPEARANCE,
    );

    const updateAppearance = (mode: Appearance): void => {
        // Dark and system both collapse to light — the product has no dark theme.
        void mode;
        forceLight();
        notify();
    };

    return {
        appearance,
        resolvedAppearance: 'light',
        updateAppearance,
    } as const;
}
