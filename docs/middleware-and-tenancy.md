# Middleware & Tenancy

Tenancy here is **path-based**: the tenant is read from the `{school}` segment of the URL (`platform.com/school/{school}/…`). There is no subdomain or Host-header logic anywhere in the app. Two custom middleware do the work.

---

## The two middleware

### `ResolveTenant` — alias `tenant`

[`app/Http/Middleware/ResolveTenant.php`](../app/Http/Middleware/ResolveTenant.php)

For a request to `/school/{school}/…` it:

1. Reads the raw `{school}` route parameter (`$request->route('school')`) — the **slug**, from the path, never the host.
2. Resolves it: `School::where('slug', $routeSchool)->firstOrFail()` (or uses the already-bound `School` model if binding ran first).
3. Aborts `403` if the school is not `is_active`.
4. If the authenticated user is school staff, aborts `403` unless `$user->school_id === $school->id` (a school user can only operate within their own school).
5. **Sets the Spatie active team to the school:** `setPermissionsTeamId($school->id)`.
6. Clears any stale relations loaded under a different team: `$user?->unsetRelation('roles')->unsetRelation('permissions')`.
7. Makes the resolved model available to route-model binding and Inertia sharing: `$request->route()->setParameter('school', $school)` and `$request->attributes->set('school', $school)`.

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
auth → verified → tenant → type:school → permission:<school.…>
```

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
- [project-structure.md](project-structure.md) — where each file type lives.
