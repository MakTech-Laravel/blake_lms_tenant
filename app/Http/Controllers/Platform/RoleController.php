<?php

namespace App\Http\Controllers\Platform;

use App\Enums\GuardEnum;
use App\Enums\PermissionDomain;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Support\PlatformTeamResolver;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Platform role management. Operates only on the global (school_id NULL) roles
 * and only ever exposes/accepts platform-domain permissions.
 */
class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $roles = Role::query()
            ->where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID)
            ->withCount(['permissions', 'users'])
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('platform/roles/index', [
            'roles' => $roles,
            'filters' => ['search' => $search],
        ]);
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
     * Guard against operating on a school's team-scoped role via a forged id.
     *
     * A tenant's roles are managed from that school's dashboard only; renaming,
     * re-permissioning or deleting one here would silently rewrite the tenant's
     * access model with platform-domain permissions.
     */
    private function ensurePlatformRole(Role $role): void
    {
        abort_unless($role->school_id === PlatformTeamResolver::PLATFORM_TEAM_ID, 404);
    }

    /**
     * Platform-domain permissions only — isolated from the school permission set.
     *
     * @return Collection<int, Permission>
     */
    private function permissions(): Collection
    {
        return Permission::query()
            ->where('domain', PermissionDomain::PLATFORM->value)
            ->orderBy('group')
            ->orderBy('id')
            ->get(['id', 'name', 'group']);
    }
}
