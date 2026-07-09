<?php

namespace App\Http\Controllers\Platform;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use App\Support\PlatformTeamResolver;
use App\Support\SuperAdmin;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

/**
 * Platform staff management. Scoped to `platform` accounts and the global
 * (school_id NULL) platform roles.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));

        $users = User::query()
            ->where('type', UserType::PLATFORM)
            ->with('roles:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role !== '', function ($query) use ($role): void {
                $query->whereHas('roles', fn ($query) => $query->where('name', $role));
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('platform/users/index', [
            'users' => $users,
            'roles' => $this->platformRoles()->pluck('name'),
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'superAdminCount' => SuperAdmin::count(),
            'stats' => Inertia::optional(fn (): array => [
                'total' => User::where('type', UserType::PLATFORM)->count(),
                'verified' => User::where('type', UserType::PLATFORM)->whereNotNull('email_verified_at')->count(),
                'roles' => $this->platformRoles()->count(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('platform/users/create', [
            'roles' => $this->platformRoles(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $data['type'] = UserType::PLATFORM;

        $user = User::create(collect($data)->except(['roles', 'remove_avatar'])->all());

        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return redirect()->route('platform.users.index');
    }

    public function show(User $user): Response
    {
        $user->load('roles:id,name', 'permissions:id,name');

        return Inertia::render('platform/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        $user->load('roles:id,name');

        return Inertia::render('platform/users/edit', [
            'user' => $user,
            'roles' => $this->platformRoles(),
            'userRoles' => $user->roles->pluck('name'),
            'isLastSuperAdmin' => SuperAdmin::isLast($user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = $request->validated();

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

        return redirect()->route('platform.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
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
     * The global platform roles (school_id NULL) assignable to platform staff.
     *
     * @return Collection<int, Role>
     */
    private function platformRoles(): Collection
    {
        return Role::where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID)
            ->orderBy('name')->get(['id', 'name']);
    }

    private function deleteAvatar(User $user): void
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
    }
}
