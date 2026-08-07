<?php

namespace App\Http\Controllers\Platform;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Exports\PeopleExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreOrganizationUserRequest;
use App\Http\Requests\User\StoreTeacherRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Models\School;
use App\Models\User;
use App\Support\PlatformTeamResolver;
use App\Support\SuperAdmin;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Platform staff management and AquaCert People / Platform Staff directories.
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

    /**
     * Platform People directory with URL tabs: ?type=all|teacher|school|platform
     */
    public function people(Request $request): Response
    {
        $typeFilter = $this->resolvePeopleTypeFilter($request->query('type'));
        $search = trim((string) $request->query('search', ''));

        $query = $this->peopleDirectoryQuery($typeFilter, $search);

        $paginator = $query->paginate(15)->withQueryString();
        $people = $paginator->through(fn (User $user): array => $this->mapDirectoryUser($user));

        $statsBase = User::query()->when(
            $typeFilter !== 'all',
            fn (Builder $builder) => $builder->where('type', $typeFilter),
            fn (Builder $builder) => $builder->whereIn('type', [
                UserType::TEACHER,
                UserType::SCHOOL,
                UserType::PLATFORM,
            ]),
        );

        return Inertia::render('platform/people/index', [
            'people' => $people,
            'stats' => [
                'total' => (clone $statsBase)->count(),
                'active' => (clone $statsBase)->where('status', UserStatus::Active)->count(),
                'pending' => (clone $statsBase)->where('status', UserStatus::Pending)->count(),
                'disabled' => (clone $statsBase)->where('status', UserStatus::Disabled)->count(),
            ],
            'filters' => [
                'search' => $search,
                'type' => $typeFilter,
            ],
            'schools' => School::query()->orderBy('name')->get(['id', 'name']),
            'roles' => $this->platformRoles()->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
            ])->values(),
        ]);
    }

    /**
     * Export the current People directory filters as CSV or Excel.
     * scope=all (default) exports every matching row; scope=visible exports only ids on the current page.
     */
    public function exportPeople(Request $request): BinaryFileResponse
    {
        $typeFilter = $this->resolvePeopleTypeFilter($request->query('type'));
        $search = trim((string) $request->query('search', ''));
        $scope = $request->query('scope') === 'visible' ? 'visible' : 'all';
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';

        $query = $this->peopleDirectoryQuery($typeFilter, $search);

        if ($scope === 'visible') {
            $ids = collect($request->query('ids', []))
                ->map(fn (mixed $id): int => (int) $id)
                ->filter(fn (int $id): bool => $id > 0)
                ->unique()
                ->values()
                ->all();

            $query->whereIn('id', $ids !== [] ? $ids : [0]);
        }

        $extension = $format === 'csv' ? 'csv' : 'xlsx';
        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        $filename = 'people-'.$scope.'-'.now()->format('Y-m-d').'.'.$extension;

        return Excel::download(
            new PeopleExport($query),
            $filename,
            $writerType,
        );
    }

    public function storeTeacher(StoreTeacherRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'type' => UserType::TEACHER,
            'status' => UserStatus::Pending,
            'school_id' => $data['school_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'email_verified_at' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Teacher added successfully.']);

        return redirect()->route('platform.people.index', ['type' => 'teacher']);
    }

    public function storePlatformStaff(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $data['type'] = UserType::PLATFORM;
        $data['status'] = UserStatus::Pending;
        $data['school_id'] = null;
        $data['branch_id'] = null;

        $user = User::create(collect($data)->except(['roles', 'remove_avatar'])->all());
        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Platform user added successfully.']);

        return redirect()->route('platform.people.index', ['type' => 'platform']);
    }

    public function storeOrganizationUser(StoreOrganizationUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'type' => UserType::SCHOOL,
            'status' => UserStatus::Pending,
            'school_id' => $data['school_id'],
            'branch_id' => $data['branch_id'] ?? null,
            'email_verified_at' => null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Organization user added successfully.']);

        return redirect()->route('platform.people.index', ['type' => 'school']);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): RedirectResponse
    {
        abort_unless(
            in_array($user->type, [UserType::TEACHER, UserType::SCHOOL, UserType::PLATFORM], true),
            404,
        );

        if ($user->type === UserType::PLATFORM) {
            $this->authorize('update', $user);
        }

        $status = UserStatus::from($request->validated('status'));

        if (
            $status === UserStatus::Disabled
            && $user->type === UserType::PLATFORM
            && SuperAdmin::isLast($user)
        ) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'You cannot disable the last super administrator.',
            ]);

            return redirect()->back();
        }

        $user->forceFill(['status' => $status])->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'User status updated.',
        ]);

        return redirect()->back();
    }

    public function destroyDirectoryUser(User $user): RedirectResponse
    {
        abort_unless(
            in_array($user->type, [UserType::TEACHER, UserType::SCHOOL, UserType::PLATFORM], true),
            404,
        );

        if ($user->type === UserType::PLATFORM) {
            $this->authorize('delete', $user);

            if (SuperAdmin::isLast($user)) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'You must assign the super-admin role to another user before deleting the last super administrator.',
                ]);

                return redirect()->back();
            }
        }

        $this->deleteAvatar($user);
        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted successfully.']);

        return redirect()->back();
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
        $data['status'] ??= UserStatus::Active;

        $user = User::create(collect($data)->except(['roles', 'remove_avatar'])->all());

        $user->syncRoles($request->validated('roles', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return redirect()->route('platform.users.index');
    }

    public function show(User $user): Response
    {
        $this->ensurePlatformUser($user);

        $user->load('roles:id,name', 'permissions:id,name');

        return Inertia::render('platform/users/show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user): Response
    {
        $this->ensurePlatformUser($user);
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
        $this->ensurePlatformUser($user);
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
        $this->ensurePlatformUser($user);
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

    private function resolvePeopleTypeFilter(mixed $type): string
    {
        $value = is_string($type) ? strtolower(trim($type)) : 'all';

        return in_array($value, ['all', 'teacher', 'school', 'platform'], true)
            ? $value
            : 'all';
    }

    /**
     * @return Builder<User>
     */
    private function peopleDirectoryQuery(string $typeFilter, string $search): Builder
    {
        return User::query()
            ->with(['school:id,name,slug', 'branch:id,name', 'roles:id,name'])
            ->when(
                $typeFilter !== 'all',
                fn (Builder $builder) => $builder->where('type', $typeFilter),
                fn (Builder $builder) => $builder->whereIn('type', [
                    UserType::TEACHER,
                    UserType::SCHOOL,
                    UserType::PLATFORM,
                ]),
            )
            ->when(
                $search !== '',
                fn (Builder $builder) => $this->applyPeopleDirectorySearch($builder, $search),
            )
            ->latest('id');
    }

    /**
     * Search people by name, email, role, organization, type, or status.
     */
    private function applyPeopleDirectorySearch(Builder $builder, string $search): void
    {
        $term = '%'.$search.'%';
        $needle = mb_strtolower($search);

        $matchingTypes = collect(UserType::cases())
            ->filter(fn (UserType $type): bool => str_contains(mb_strtolower($type->value), $needle)
                || str_contains(mb_strtolower($type->label()), $needle))
            ->map(fn (UserType $type): string => $type->value)
            ->all();

        $matchingStatuses = collect(UserStatus::cases())
            ->filter(fn (UserStatus $status): bool => str_contains(mb_strtolower($status->value), $needle)
                || str_contains(mb_strtolower($status->label()), $needle))
            ->map(fn (UserStatus $status): string => $status->value)
            ->all();

        $builder->where(function (Builder $query) use ($term, $needle, $matchingTypes, $matchingStatuses): void {
            $query->where('name', 'like', $term)
                ->orWhere('email', 'like', $term)
                ->orWhereHas('roles', fn (Builder $roles) => $roles->where('name', 'like', $term))
                ->orWhereHas('school', fn (Builder $schools) => $schools->where('name', 'like', $term));

            if (str_contains(mb_strtolower('Instructor'), $needle)) {
                $query->orWhere('type', UserType::TEACHER);
            }

            if (str_contains(mb_strtolower('AquaCert'), $needle)) {
                $query->orWhere('type', UserType::PLATFORM);
            }

            if ($matchingTypes !== []) {
                $query->orWhereIn('type', $matchingTypes);
            }

            if ($matchingStatuses !== []) {
                $query->orWhereIn('status', $matchingStatuses);
            }
        });
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     avatar_url: string|null,
     *     initials: string,
     *     organization: string,
     *     location: string,
     *     role: string,
     *     status: string,
     *     user_type: string,
     *     user_type_label: string,
     *     last_login_at: string|null,
     *     last_login_label: string,
     *     edit_url: string|null
     * }
     */
    private function mapDirectoryUser(User $user): array
    {
        $organization = $user->type === UserType::PLATFORM
            ? 'AquaCert'
            : ($user->school?->name ?? '—');

        $editUrl = null;

        if ($user->type === UserType::PLATFORM) {
            $editUrl = route('platform.users.edit', $user);
        } elseif ($user->type === UserType::SCHOOL && $user->school?->slug) {
            $editUrl = route('school.users.edit', [$user->school->slug, $user]);
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatarUrl(),
            'initials' => $user->initials(),
            'organization' => $organization,
            'location' => $user->branch?->name ?? '—',
            'role' => $user->directoryRoleLabel(),
            'status' => $user->status?->label() ?? UserStatus::Active->label(),
            'user_type' => $user->type->value,
            'user_type_label' => $user->type->label(),
            'last_login_at' => optional($user->last_login_at)?->toIso8601String(),
            'last_login_label' => $user->last_login_at
                ? $user->last_login_at->diffForHumans(short: true)
                : '—',
            'edit_url' => $editUrl,
        ];
    }

    private function ensurePlatformUser(User $user): void
    {
        abort_unless($user->type === UserType::PLATFORM, 404);
    }

    /**
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
