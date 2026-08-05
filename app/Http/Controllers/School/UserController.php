<?php

namespace App\Http\Controllers\School;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\School\StoreUserRequest;
use App\Http\Requests\School\UpdateUserRequest;
use App\Models\Branch;
use App\Models\School;
use App\Models\User;
use App\Support\SuperAdmin;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

/**
 * School staff management. Scoped to `school` accounts belonging to the current
 * school and that school's team-scoped roles.
 */
class UserController extends Controller
{
    public function index(Request $request, School $school): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));

        // Head-office staff may narrow the list to one branch; for a pinned
        // actor the filter is ignored, since forCurrentBranch() already limits
        // the list to their own branch and nothing else is selectable.
        $branchFilter = $request->user()->isHeadOffice()
            ? (int) $request->query('branch', 0)
            : 0;

        $users = User::query()
            ->where('type', UserType::SCHOOL)
            ->where('school_id', $school->id)
            ->forCurrentBranch()
            ->with('roles:id,name', 'branch:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', function ($query) use ($role): void {
                $query->whereHas('roles', fn ($query) => $query->where('name', $role));
            })
            ->when($branchFilter > 0, fn ($query) => $query->where('branch_id', $branchFilter))
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('school/users/index', [
            'users' => $users,
            'roles' => $this->schoolRoles($school)->pluck('name'),
            'branches' => $this->assignableBranches($school),
            'filters' => [
                'search' => $search,
                'role' => $role,
                'branch' => $branchFilter > 0 ? $branchFilter : null,
            ],
            'superAdminCount' => SuperAdmin::count(),
        ]);
    }

    public function create(School $school): Response
    {
        return Inertia::render('school/users/create', [
            'roles' => $this->schoolRoles($school),
            'branches' => $this->assignableBranches($school),
        ]);
    }

    public function store(StoreUserRequest $request, School $school): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $data['type'] = UserType::SCHOOL;
        $data['school_id'] = $school->id;
        $data['branch_id'] = $this->resolveBranchId($data['branch_id'] ?? null);

        $user = User::create(collect($data)->except(['roles', 'remove_avatar'])->all());

        // Team context is this school (set by ResolveTenant), so roles are
        // assigned within the school's team.
        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return redirect()->route('school.users.index', $school);
    }

    public function show(School $school, User $user): Response
    {
        $this->ensureVisible($school, $user);

        $user->load('roles:id,name', 'permissions:id,name', 'branch:id,name');

        return Inertia::render('school/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(School $school, User $user): Response
    {
        $this->ensureVisible($school, $user);
        $this->authorize('update', $user);

        $user->load('roles:id,name');

        return Inertia::render('school/users/edit', [
            'user' => $user,
            'roles' => $this->schoolRoles($school),
            'branches' => $this->assignableBranches($school),
            'userRoles' => $user->roles->pluck('name'),
            'isLastSuperAdmin' => SuperAdmin::isLast($user),
        ]);
    }

    public function update(UpdateUserRequest $request, School $school, User $user): RedirectResponse
    {
        $this->ensureVisible($school, $user);
        $this->authorize('update', $user);

        $data = $request->validated();
        $data['branch_id'] = $this->resolveBranchId($data['branch_id'] ?? null);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        if ($request->hasFile('avatar')) {
            $this->deleteAvatar($user);
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar')) {
            $this->deleteAvatar($user);
            $data['avatar'] = null;
        }

        $user->update(collect($data)->except(['roles', 'remove_avatar'])->all());
        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated successfully.']);

        return redirect()->route('school.users.index', $school);
    }

    public function destroy(School $school, User $user): RedirectResponse
    {
        $this->ensureVisible($school, $user);
        $this->authorize('delete', $user);

        if (SuperAdmin::isLast($user)) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'You must assign the super-admin role to another user before deleting the last super administrator.',
            ]);

            return redirect()->back();
        }

        $this->deleteAvatar($user);
        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted successfully.']);

        return redirect()->back();
    }

    /**
     * Guard against operating on a user the actor should not see, whether via a
     * forged id from another school or from another branch of the same school.
     *
     * `User` carries no global branch scope (that would recurse through the auth
     * guard's own user lookup), so this check is explicit rather than implicit.
     */
    private function ensureVisible(School $school, User $user): void
    {
        abort_unless(
            $user->school_id === $school->id && $user->type === UserType::SCHOOL,
            404,
        );

        $actor = Auth::user();

        // A branch-pinned actor sees only their own branch's staff — not other
        // branches', and not head-office accounts either.
        abort_unless(
            $actor->isHeadOffice() || $actor->branch_id === $user->branch_id,
            404,
        );
    }

    /**
     * The branch a staff member should be pinned to.
     *
     * A branch-pinned actor may only ever place staff in their own branch, so
     * the submitted value is discarded for them. Only head office may choose,
     * including choosing NULL for school-wide access.
     */
    private function resolveBranchId(?int $requested): ?int
    {
        $actor = Auth::user();

        return $actor->isHeadOffice() ? $requested : $actor->branch_id;
    }

    /**
     * Branches a staff member may be assigned to — this school's active ones.
     * Empty for a branch-pinned actor, who has no choice to make.
     *
     * @return Collection<int, Branch>
     */
    private function assignableBranches(School $school): Collection
    {
        if (! Auth::user()->isHeadOffice()) {
            return new Collection;
        }

        return Branch::where('school_id', $school->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * The current school's team-scoped roles.
     *
     * @return Collection<int, Role>
     */
    private function schoolRoles(School $school): Collection
    {
        return Role::where('school_id', $school->id)->orderBy('name')->get(['id', 'name']);
    }

    private function deleteAvatar(User $user): void
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
    }
}
