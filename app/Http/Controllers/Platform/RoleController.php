<?php

namespace App\Http\Controllers\Platform;

use App\Enums\GuardEnum;
use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Enums\UserStatus;
use App\Exports\RolesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Models\User;
use App\Support\PlatformTeamResolver;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Platform role management. Operates only on platform-team roles
 * and only ever exposes/accepts platform-domain permissions.
 */
class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->resolveFilters($request);

        $roles = $this->rolesQuery($filters)
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Role $role): array => $this->mapRole($role));

        return Inertia::render('platform/roles/index', [
            'roles' => $roles,
            'filters' => $filters,
        ]);
    }

    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->resolveFilters($request);
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';
        $extension = $format === 'csv' ? 'csv' : 'xlsx';
        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(
            new RolesExport($this->rolesQuery($filters)),
            'roles-'.now()->format('Y-m-d').'.'.$extension,
            $writerType,
        );
    }

    public function create(): Response
    {
        return Inertia::render('platform/roles/create', [
            'permissions' => $this->permissions(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create([
            'name' => $request->validated('name'),
            'guard_name' => GuardEnum::WEB->value,
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role created successfully.']);

        return redirect()->route('platform.roles.index');
    }

    /**
     * Read-only role profile: summary, permission coverage per group, and the
     * users currently holding the role.
     */
    public function show(Role $role): Response
    {
        $this->ensurePlatformRole($role);

        $role->loadCount('users');
        $role->load('permissions:id,name,group');

        $isSuperAdmin = $role->name === RoleEnum::SUPER_ADMIN->value;

        $allPermissions = Permission::query()
            ->where('domain', PermissionDomain::PLATFORM->value)
            ->orderBy('group')
            ->orderBy('id')
            ->get(['id', 'name', 'group']);

        $grantedNames = ($isSuperAdmin ? $allPermissions : $role->permissions)
            ->pluck('name')
            ->flip();

        return Inertia::render('platform/roles/show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $this->displayName($role->name),
                'guard_name' => $role->guard_name,
                'is_system' => $isSuperAdmin,
                'scope' => 'Global',
                'users_count' => $role->users_count,
                'granted_count' => $grantedNames->count(),
                'total_count' => $allPermissions->count(),
                'created_label' => $role->created_at?->format('M j, Y') ?? '—',
                'updated_label' => $role->updated_at?->format('M j, Y') ?? '—',
                'updated_relative' => $role->updated_at?->diffForHumans() ?? '—',
            ],
            'permissionGroups' => $this->permissionCoverage($allPermissions, $grantedNames),
            'assignedUsers' => $this->assignedUsers($role),
        ]);
    }

    public function edit(Role $role): Response
    {
        $this->ensurePlatformRole($role);

        $role->load('permissions:id,name');

        return Inertia::render('platform/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'is_super_admin' => $role->name === RoleEnum::SUPER_ADMIN->value,
            ],
            'permissions' => $this->permissions(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->ensurePlatformRole($role);

        $role->update(['name' => $request->validated('name')]);
        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated successfully.']);

        return redirect()->route('platform.roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->ensurePlatformRole($role);

        if ($role->name === RoleEnum::SUPER_ADMIN->value) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'The super-admin role cannot be deleted.']);

            return redirect()->back();
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted successfully.']);

        return redirect()->back();
    }

    /**
     * @return array{search: string, kind: string, users: string, permissions: string}
     */
    private function resolveFilters(Request $request): array
    {
        $kind = strtolower(trim((string) $request->query('kind', '')));
        $users = strtolower(trim((string) $request->query('users', '')));
        $permissions = strtolower(trim((string) $request->query('permissions', '')));

        return [
            'search' => trim((string) $request->query('search', '')),
            'kind' => in_array($kind, ['system', 'custom'], true) ? $kind : '',
            'users' => in_array($users, ['with', 'without'], true) ? $users : '',
            'permissions' => in_array($permissions, ['none', 'some', 'many'], true) ? $permissions : '',
        ];
    }

    /**
     * @param  array{search: string, kind: string, users: string, permissions: string}  $filters
     * @return Builder<Role>
     */
    private function rolesQuery(array $filters): Builder
    {
        return Role::query()
            ->where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID)
            ->withCount(['permissions', 'users'])
            ->when(
                $filters['search'] !== '',
                fn (Builder $query) => $query->where('name', 'like', '%'.$filters['search'].'%'),
            )
            ->when(
                $filters['kind'] === 'system',
                fn (Builder $query) => $query->where('name', RoleEnum::SUPER_ADMIN->value),
            )
            ->when(
                $filters['kind'] === 'custom',
                fn (Builder $query) => $query->where('name', '!=', RoleEnum::SUPER_ADMIN->value),
            )
            ->when(
                $filters['users'] === 'with',
                fn (Builder $query) => $query->has('users'),
            )
            ->when(
                $filters['users'] === 'without',
                fn (Builder $query) => $query->doesntHave('users'),
            )
            ->when(
                $filters['permissions'] === 'none',
                fn (Builder $query) => $query
                    ->where('name', '!=', RoleEnum::SUPER_ADMIN->value)
                    ->doesntHave('permissions'),
            )
            ->when(
                $filters['permissions'] === 'some',
                fn (Builder $query) => $query
                    ->where('name', '!=', RoleEnum::SUPER_ADMIN->value)
                    ->has('permissions')
                    ->has('permissions', '<', 20),
            )
            ->when(
                $filters['permissions'] === 'many',
                fn (Builder $query) => $query->where(function (Builder $builder): void {
                    $builder->where('name', RoleEnum::SUPER_ADMIN->value)
                        ->orHas('permissions', '>=', 20);
                }),
            )
            ->orderBy('name');
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     guard_name: string,
     *     permissions_count: int,
     *     users_count: int,
     *     is_system: bool,
     *     scope: string,
     *     updated_at: string|null,
     *     updated_label: string,
     *     created_at: string
     * }
     */
    private function mapRole(Role $role): array
    {
        $isSuper = $role->name === RoleEnum::SUPER_ADMIN->value;

        return [
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'permissions_count' => $isSuper ? Permission::query()->where('domain', PermissionDomain::PLATFORM->value)->count() : $role->permissions_count,
            'users_count' => $role->users_count,
            'is_system' => $isSuper,
            'scope' => 'Global',
            'updated_at' => optional($role->updated_at)?->toDateString(),
            'updated_label' => optional($role->updated_at)?->format('Y-m-d') ?? '—',
            'created_at' => (string) $role->created_at,
        ];
    }

    private function ensurePlatformRole(Role $role): void
    {
        abort_unless($role->school_id === PlatformTeamResolver::PLATFORM_TEAM_ID, 404);
    }

    /**
     * Turn a slug-style role name into a title, e.g. "super-admin" → "Super Admin".
     */
    private function displayName(string $name): string
    {
        return ucwords(str_replace(['-', '_'], ' ', $name));
    }

    /**
     * Every platform permission grouped by module, flagged with whether the role
     * grants it, so the detail page can show coverage instead of only grants.
     *
     * @param  EloquentCollection<int, Permission>  $allPermissions
     * @param  Collection<string, int>  $grantedNames
     * @return array<int, array{
     *     group: string,
     *     total: int,
     *     granted_count: int,
     *     permissions: array<int, array{name: string, label: string, granted: bool}>
     * }>
     */
    private function permissionCoverage(EloquentCollection $allPermissions, Collection $grantedNames): array
    {
        return $allPermissions
            ->groupBy(fn (Permission $permission): string => $permission->group ?? 'Other')
            ->map(function (mixed $items, string $group) use ($grantedNames): array {
                $permissions = collect($items)
                    ->map(fn (Permission $permission): array => [
                        'name' => $permission->name,
                        'label' => PermissionEnum::labelFor($permission->name),
                        'granted' => $grantedNames->has($permission->name),
                    ])
                    ->values();

                return [
                    'group' => $group,
                    'total' => $permissions->count(),
                    'granted_count' => $permissions->where('granted', true)->count(),
                    'permissions' => $permissions->all(),
                ];
            })
            ->sortKeys()
            ->values()
            ->all();
    }

    /**
     * Users currently holding the role, linked to their profile pages.
     *
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     initials: string,
     *     avatar_url: string|null,
     *     type_label: string,
     *     status: string,
     *     profile_url: string
     * }>
     */
    private function assignedUsers(Role $role): array
    {
        return $role->users()
            ->orderBy('name')
            ->limit(50)
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'initials' => $user->initials(),
                'avatar_url' => $user->avatarUrl(),
                'type_label' => $user->type->label(),
                'status' => $user->status?->label() ?? UserStatus::Active->label(),
                'profile_url' => route('platform.people.show', $user),
            ])
            ->all();
    }

    /**
     * @return Collection<int, array{id: int, name: string, group: string, label: string}>
     */
    private function permissions(): Collection
    {
        return Permission::query()
            ->where('domain', PermissionDomain::PLATFORM->value)
            ->orderBy('group')
            ->orderBy('id')
            ->get(['id', 'name', 'group'])
            ->map(fn (Permission $permission): array => [
                'id' => $permission->id,
                'name' => $permission->name,
                'group' => $permission->group,
                'label' => PermissionEnum::labelFor($permission->name),
            ]);
    }
}
