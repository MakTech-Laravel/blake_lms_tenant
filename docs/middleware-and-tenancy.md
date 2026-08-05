# Middleware & Tenancy

Tenancy here is **path-based**: the tenant is read from the `{school}` segment of the URL (`platform.com/school/{school}/…`). There is no subdomain or Host-header logic anywhere in the app. Three custom middleware do the work.

> Branches are a second scoping layer *inside* a school, and they are deliberately absent from the URL — see [branches.md](branches.md).

---

## The three middleware

### `ResolveTenant` — alias `tenant`

[`app/Http/Middleware/ResolveTenant.php`](../app/Http/Middleware/ResolveTenant.php)

For a request to `/school/{school}/…` it:

1. Reads the raw `{school}` route parameter (`$request->route('school')`) — the **slug**, from the path, never the host.
2. Resolves it: `School::where('slug', $routeSchool)->firstOrFail()` (or uses the already-bound `School` model if binding ran first).
3. Aborts `403` if the school is not `is_active`.
4. If the authenticated user is school staff, aborts `403` unless `$user->school_id === $school->id` (a school user can only operate within their own school).
5. If the user is **pinned to a branch**, aborts `403` unless that branch belongs to this school and is active. Validating it once here means the [branch scoping layer](branches.md) can trust `branch_id` without re-checking it on every query. Head-office users (`branch_id` `NULL`) skip this entirely — the relation short-circuits without a query.
6. **Sets the Spatie active team to the school:** `setPermissionsTeamId($school->id)`.
7. Clears any stale relations loaded under a different team: `$user?->unsetRelation('roles')->unsetRelation('permissions')`.
8. Makes the resolved model available to route-model binding and Inertia sharing: `$request->route()->setParameter('school', $school)` and `$request->attributes->set('school', $school)`.

Note that step 5 checks the branch but **never** touches the team key — the active team is the school and nothing else.

That last step is why controllers can type-hint `School $school` and get the resolved model, and why [`HandleInertiaRequests`](../app/Http/Middleware/HandleInertiaRequests.php) can share the current `school` prop to the frontend.

### `EnsureUserType` — alias `type`

[`app/Http/Middleware/EnsureUserType.php`](../app/Http/Middleware/EnsureUserType.php)

A variadic guard: `->middleware('type:platform')`, `type:school`, `type:teacher`. It aborts `403` unless the authenticated user's `type` (a [`UserType`](../app/Enums/UserType.php) enum) is one of the listed values:

```php
public function handle(Request $request, Closure $next, string ...$types): Response
{
    $user = $request->user();
    abort_if($user === null, 403);
    abort_unless(in_array($user->type->value, $types, true), 403);
    return $next($request);
}
```

This is what keeps the three dashboards mutually exclusive — a school user cannot reach `/platform/*`, a teacher cannot reach a school's staff routes, etc.

### `EnsureHeadOffice` — alias `head_office`

[`app/Http/Middleware/EnsureHeadOffice.php`](../app/Http/Middleware/EnsureHeadOffice.php)

Aborts `403` unless the user is **head office** (`branch_id` is `NULL`, i.e. school-wide). Currently applied to the `branches.*` routes, since changing a school's branch structure is a head-office action.

```php
abort_unless($user->isHeadOffice(), 403, 'Only head-office staff can manage branches.');
```

It deliberately does **not** consult permissions, and stacks *with* a `permission:` gate rather than replacing one. Because roles are shared across a school's branches, a branch manager may genuinely hold `school.branches.create` through their role — and must still be refused. See [branches.md](branches.md#managing-branches).

---

## Registration & order

Both aliases are registered in [`bootstrap/app.php`](../bootstrap/app.php):

```php
$middleware->alias([
    'role' => RoleMiddleware::class,
    'permission' => PermissionMiddleware::class,
    'role_or_permission' => RoleOrPermissionMiddleware::class,
    'tenant' => ResolveTenant::class,
    'type' => EnsureUserType::class,
    'head_office' => EnsureHeadOffice::class,
]);

// Resolve the tenant (and set Spatie's active team) before route-model
// binding runs, per the Spatie Teams guidance.
$middleware->prependToPriorityList(
    before: SubstituteBindings::class,
    prepend: ResolveTenant::class,
);
```

`ResolveTenant` is pushed **before `SubstituteBindings`** in the priority list so the active team is set before route-model binding and the `permission:` middleware run.

Within a school route group the middleware run in this order:

```
auth → verified → tenant → type:school → [head_office] → permission:<school.…>
```

`head_office` appears only on the `branches.*` group.

`role`, `permission`, and `role_or_permission` are the standard Spatie middleware (unchanged from the starter kit).

---

## End-to-end: `{school}` slug → active team

Take `GET /school/riverside-teacher-institute/roles` as a logged-in school super-admin:

1. **`auth` / `verified`** confirm the user is logged in and verified.
2. **`tenant` (`ResolveTenant`)** reads `riverside-teacher-institute`, loads the `School`, checks `is_active` and membership, then calls `setPermissionsTeamId($school->id)`. The Spatie active team is now this school.
3. **`type:school`** confirms `user.type === 'school'`.
4. **`permission:school.roles.index`** checks the permission **in the active team**. For a super-admin, `Gate::before` (see [permissions.md](permissions.md#6-super-admin-bypass-gatebefore--team-id-0)) short-circuits it to `true`; for anyone else, it checks whether one of the user's school-team roles grants `school.roles.index`.
5. The controller action `index(Request $request, School $school)` receives the resolved model (from step 2's `setParameter`).
6. When the Inertia response is built, `HandleInertiaRequests::share()` reads `$request->attributes->get('school')` and exposes it as the `school` prop; `auth.user.roles` / `permissions` / `is_super_admin` are all resolved in the school team.

Outside a school route (platform, teacher, seeders, tests) nobody calls `setPermissionsTeamId`, so [`PlatformTeamResolver`](../app/Support/PlatformTeamResolver.php) returns the reserved platform team `0`.

---

## Adding a new protected route

### Platform (`/platform/*`)

Edit [`routes/platform.php`](../routes/platform.php). The group already applies `['auth', 'verified', 'type:platform']`; add per-route permission gates:

```php
use App\Enums\PermissionEnum;
use App\Http\Controllers\Platform\ReportController;

Route::get('reports', [ReportController::class, 'index'])->name('reports.index')
    ->middleware('permission:'.PermissionEnum::REPORTS_INDEX->value);
```

- Controller goes in `app/Http/Controllers/Platform/`.
- Render an Inertia page named `platform/…` (so the `platform/` layout resolver picks `PlatformLayout`).
- Add a page under `resources/js/pages/platform/`.

### School (`/school/{school}/*`)

Edit [`routes/school.php`](../routes/school.php). The group applies `['auth', 'verified', 'tenant', 'type:school']`, so tenancy is already resolved:

```php
Route::get('reports', [ReportController::class, 'index'])->name('reports.index')
    ->middleware('permission:'.PermissionEnum::SCHOOL_BILLING_VIEW->value);
```

- Controller goes in `app/Http/Controllers/School/`. Its actions receive `School $school` as the first bound parameter (plus any other `{param}`). Verify child models belong to the school (see `ensureBelongsToSchool()` in the existing school controllers).
- If the route exposes **branch-specific** records, read [branches.md](branches.md) first: models using `BelongsToBranch` are filtered automatically, but `User` is not and needs an explicit check. If the route manages branches themselves, add `->middleware('head_office')`.
- If the route binds a **child of the school** whose key is only unique per school (as branch slugs are), add `->scopeBindings()` to the group.
- Render `school/…`; add a page under `resources/js/pages/school/` and thread the tenant slug through route helpers with `useTenant()` (see [layouts-and-dashboards.md](layouts-and-dashboards.md)).

### Teacher (`/dashboard/*`)

Edit [`routes/teacher.php`](../routes/teacher.php). The group applies `['auth', 'verified', 'type:teacher']` with a `dashboard` URL prefix and `teacher.` name prefix. Teachers hold **no roles**, so there are **no `permission:` gates** — access is by type only:

```php
Route::get('transcript', [TranscriptController::class, 'index'])->name('transcript.index');
// → GET /dashboard/transcript, name teacher.transcript.index
```

- Controller goes in `app/Http/Controllers/Teacher/`. Read the teacher's own data via `$request->user()` (e.g. `courseEnrollments()`, `certificates()`).
- Render `teacher/…`; add a page under `resources/js/pages/teacher/`.

> The universal entry point `GET /dashboard` (name `dashboard`) is defined in [`routes/web.php`](../routes/web.php) and handled by [`Teacher\DashboardController`](../app/Http/Controllers/Teacher/DashboardController.php), which **redirects** platform users to `platform.dashboard`, school users to `school.dashboard` (their school), and renders the teacher dashboard for teachers. It intentionally has **no** `type:` guard so every account type can hit it and be routed onward.

After adding any route that the frontend links to, regenerate the typed route helpers by running a build (`pnpm run build`) — the Wayfinder Vite plugin regenerates `resources/js/routes/**`. (Do **not** use `php artisan wayfinder:generate`; it omits the `.form` variants the app relies on.)

---

## Related

- [permissions.md](permissions.md) — the domain/team model and super-admin bypass.
- [branches.md](branches.md) — the branch data-scoping layer inside a school.
- [project-structure.md](project-structure.md) — where each file type lives.
