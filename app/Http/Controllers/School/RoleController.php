<?php

namespace App\Http\Controllers\School;

use App\Enums\GuardEnum;
use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\School\StoreRoleRequest;
use App\Http\Requests\School\UpdateRoleRequest;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * School role management. Operates only on the current school's team-scoped
 * roles and only ever exposes/accepts school-domain permissions.
 */
class RoleController extends Controller
{
    public function index(Request $request, School $school): Response
    {
        $search = trim((string) $request->query('search', ''));

        $roles = Role::query()
            ->where('school_id', $school->id)
            ->withCount(['permissions', 'users'])
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('school/roles/index', [
            'roles' => $roles,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(School $school): Response
    {
        return Inertia::render('school/roles/create', [
            'permissions' => $this->permissions(),
        ]);
    }

    public function store(StoreRoleRequest $request, School $school): RedirectResponse
    {
        $role = Role::create([
            'name' => $request->validated('name'),
            'guard_name' => GuardEnum::WEB->value,
            'school_id' => $school->id,
        ]);

        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role created successfully.']);

        return redirect()->route('school.roles.index', $school);
    }

    public function edit(School $school, Role $role): Response
    {
        $this->ensureBelongsToSchool($school, $role);

        $role->load('permissions:id,name');

        return Inertia::render('school/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'is_super_admin' => $role->name === RoleEnum::SUPER_ADMIN->value,
            ],
            'permissions' => $this->permissions(),
        ]);
    }

    public function update(UpdateRoleRequest $request, School $school, Role $role): RedirectResponse
    {
        $this->ensureBelongsToSchool($school, $role);

        $role->update(['name' => $request->validated('name')]);
        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated successfully.']);

        return redirect()->route('school.roles.index', $school);
    }

    public function destroy(School $school, Role $role): RedirectResponse
    {
        $this->ensureBelongsToSchool($school, $role);

        if ($role->name === RoleEnum::SUPER_ADMIN->value) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'The super-admin role cannot be deleted.']);

            return redirect()->back();
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted successfully.']);

        return redirect()->back();
    }

    /**
     * Guard against operating on another school's role via a forged id.
     */
    private function ensureBelongsToSchool(School $school, Role $role): void
    {
        abort_unless($role->school_id === $school->id, 404);
    }

    /**
     * School-domain permissions only — isolated from the platform permission set.
     *
     * @return Collection<int, array{id: int, name: string, group: string, label: string}>
     */
    private function permissions(): Collection
    {
        return Permission::query()
            ->where('domain', PermissionDomain::SCHOOL->value)
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
