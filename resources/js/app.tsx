import { createInertiaApp, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorBoundaryFallback } from '@/components/error-boundary/error-boundary-fallback';
import { pushError } from '@/components/error-boundary/error-store';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useDevErrorFallback } from '@/hooks/useDevErrorFallback';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import PlatformLayout from '@/layouts/platform-layout';
import SchoolLayout from '@/layouts/school-layout';
import SettingsLayout from '@/layouts/settings/layout';
import TeacherLayout from '@/layouts/teacher-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

/**
 * Shared pages (the personal notification inbox) live outside every portal
 * prefix, so they cannot be routed by path alone. The server sends `shell`
 * from the account type so the AquaCert chrome matches the user's home portal
 * instead of falling through to the starter-kit layout.
 */
function layoutForShell(shell: unknown) {
    switch (shell) {
        case 'school':
            return SchoolLayout;
        case 'teacher':
            return TeacherLayout;
        case 'platform':
            return PlatformLayout;
        default:
            return AppLayout;
    }
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name, page) => {
        switch (true) {
            case name === 'welcome':
            case name === 'auth/login':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('platform/'):
                return PlatformLayout;
            case name.startsWith('school/'):
                return SchoolLayout;
            case name.startsWith('teacher/'):
                return TeacherLayout;
            case name === 'notifications/index':
                return layoutForShell(page?.props?.shell);
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <ErrorBoundary
                    FallbackComponent={ErrorBoundaryFallback}
                    onReset={() => router.reload()}
                    onError={(error, info) => {
                        // Push into persistent history (sessionStorage)
                        pushError(error, info.componentStack ?? null);

                        if (useDevErrorFallback()) {
                            console.error(error, info.componentStack);
                        }
                    }}
                >
                    {app}
                </ErrorBoundary>
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    expand={true}
                    duration={3000}
                    icons={{
                        success: <CheckCircle className="h-4 w-4" />,
                        error: <XCircle className="h-4 w-4" />,
                        warning: <AlertTriangle className="h-4 w-4" />,
                        info: <Info className="h-4 w-4" />,
                    }}
                />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'var(--primary)',
    },
});

// Product is light-mode only — strips any leftover dark preference on load.
initializeTheme();
