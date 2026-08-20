<?php

namespace App\Http\Middleware;

use App\Enums\RoleEnum;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Roles/permissions are resolved in the active team context (set by
        // ResolveTenant on school routes, NULL on platform/teacher routes), so
        // these reflect the current dashboard the user is viewing.
        $user?->load(['roles', 'permissions', 'school', 'branch']);

        // Prefer the school ResolveTenant pinned on the request. Shared pages
        // such as the personal inbox sit outside `/school/{school}`, so fall
        // back to the account's own school for school staff — otherwise their
        // AquaCert school shell has no tenant to render the sidebar from.
        $school = $request->attributes->get('school')
            ?? ($user?->isSchoolStaff() ? $user->school : null);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'avatar_url' => $user->avatarUrl(),
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()
                        ->pluck('name'),
                    'is_super_admin' => $user->hasRole(RoleEnum::SUPER_ADMIN->value),
                ]) : null,
            ],
            // Portal chrome for shared pages (settings, personal inbox) that live
            // outside /platform, /school/{slug}, and /teacher prefixes.
            'shell' => $user ? match (true) {
                $user->isPlatformStaff() => 'platform',
                $user->isSchoolStaff() => 'school',
                default => 'teacher',
            } : null,
            // The current tenant, or null outside a school context.
            'school' => $school ? [
                'id' => $school->id,
                'name' => $school->name,
                'slug' => $school->slug,
            ] : null,
            // The branch data-scoping context. Null outside a school context.
            // `pinned` is null for head-office staff, who see every branch.
            'branch' => $school && $user ? [
                'isHeadOffice' => $user->isHeadOffice(),
                'pinned' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'slug' => $user->branch->slug,
                ] : null,
            ] : null,
            // The header bell's badge. Just the count: the list itself is fetched
            // when the popover opens, so every page does not pay for notifications
            // nobody is looking at.
            'notifications' => $user ? [
                'unread_count' => $user->unreadNotificationCount(),
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
