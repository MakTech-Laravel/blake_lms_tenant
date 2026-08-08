import { cn } from '@/lib/utils';

type AquaCertLogoProps = {
    className?: string;
    variant?: 'light' | 'dark' | 'split';
};

export function AquaCertLogo({
    className,
    variant = 'split',
}: AquaCertLogoProps) {
    const aquaClass =
        variant === 'light'
            ? 'text-white'
            : variant === 'dark'
              ? 'text-navy-500'
              : 'text-navy-500';
    const certClass =
        variant === 'light'
            ? 'text-aqua-300'
            : variant === 'dark'
              ? 'text-aqua-500'
              : 'text-aqua-500';

    return (
        <span
            className={cn(
                'inline-flex items-baseline text-h6 font-semibold tracking-tight',
                className,
            )}
        >
            <span className={aquaClass}>
                Aq
                <span className="relative inline-block">
                    u
                    <span
                        aria-hidden
                        className={cn(
                            'absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-[35%] rounded-full',
                            variant === 'light' ? 'bg-aqua-300' : 'bg-aqua-500',
                        )}
                    />
                </span>
                a
            </span>
            <span className={certClass}>Cert</span>
        </span>
    );
}
