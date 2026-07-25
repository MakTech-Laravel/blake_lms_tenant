const STORAGE_KEY = 'blake.lucide-icon-picker.recents';
const MAX_RECENTS = 12;

export function readRecentIcons(): string[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as unknown;

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((item): item is string => typeof item === 'string');
    } catch {
        return [];
    }
}

export function pushRecentIcon(key: string): string[] {
    const next = [
        key,
        ...readRecentIcons().filter((item) => item !== key),
    ].slice(0, MAX_RECENTS);

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Ignore quota / private-mode failures.
        }
    }

    return next;
}
