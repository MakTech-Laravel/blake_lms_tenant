<?php

namespace App\Http\Controllers\Platform;

use App\Enums\GuardEnum;
use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Exports\RolesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Support\PlatformTeamResolver;
use Illuminate\Database\Eloquent\Builder;
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
