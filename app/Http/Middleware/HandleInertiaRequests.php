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
        $user?->load('roles', 'permissions');

        $school = $request->attributes->get('school');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()
                        ->pluck('name'),
                    'is_super_admin' => $user->hasRole(RoleEnum::SUPER_ADMIN->value),
                ]) : null,
            ],
            // The current tenant, or null outside the school dashboard.
            'school' => $school ? [
                'id' => $school->id,
                'name' => $school->name,
                'slug' => $school->slug,
            ] : null,
            // The branch data-scoping context. Null outside the school
            // dashboard. `pinned` is null for head-office staff, who see every
            // branch; the relation is already loaded by ResolveTenant, which
            // validated it, so this costs no extra query.
            'branch' => $school && $user ? [
                'isHeadOffice' => $user->isHeadOffice(),
                'pinned' => $user->branch ? [
                    'id' => $user->branch->id,
                    'name' => $user->branch->name,
                    'slug' => $user->branch->slug,
                ] : null,
            ] : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
