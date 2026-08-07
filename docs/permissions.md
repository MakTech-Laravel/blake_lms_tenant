# Permissions

This platform uses [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission) v7 with the **Teams** feature enabled. Every role belongs to a "team", and here the team is a **school**. The platform itself is a reserved team (`0`). Permissions are **not** team-scoped (they are global), but each permission is tagged with a **domain** (`platform` or `school`) so the two dashboards' permission sets stay completely isolated.

---

## 1. Domain isolation — how it actually works

### The `domain` column

The Spatie `permissions` table has a project-specific `domain` column, added in the migration
[`database/migrations/2026_05_30_111535_add_group_to_permissions_table.php`](../database/migrations/2026_05_30_111535_add_group_to_permissions_table.php):

```php
Schema::table($table, function (Blueprint $table) {
    $table->string('group')->nullable()->after('guard_name');
    $table->string('domain')->nullable()->after('group')->index();
});
```

The allowed values live in the [`App\Enums\PermissionDomain`](../app/Enums/PermissionDomain.php) enum:

```php
enum PermissionDomain: string
{
    case PLATFORM = 'platform';
    case SCHOOL = 'school';
}
```

### Where the domain is decided

The domain of each permission is decided by the `domain()` method on
[`App\Enums\PermissionEnum`](../app/Enums/PermissionEnum.php) — **not** by the permission's name. Everything defaults to `PLATFORM`; only the explicitly-listed `school.*` cases are `SCHOOL`:

```php
public function domain(): PermissionDomain
{
    return match ($this) {
        self::SCHOOL_STAFF_INDEX,
        self::SCHOOL_STAFF_VIEW,
        // ... every school.* case ...
        self::SCHOOL_SETTINGS_EDIT => PermissionDomain::SCHOOL,

        default => PermissionDomain::PLATFORM,
    };
}
```

> **Important:** the `school.` name prefix is a naming convention only. The actual domain is whatever `domain()` returns. If you add a `SCHOOL`-domain permission you must add its case to the `SCHOOL` arm of `domain()`, not just name it `school.*`.

### Where isolation is enforced (server-side, not by convention)

Isolation is enforced in **two** places on the backend, so it holds even if the client is tampered with:

1. **The permission picker query.** Each dashboard's role controller only ever loads its own domain's permissions:

   - Platform — [`app/Http/Controllers/Platform/RoleController.php`](../app/Http/Controllers/Platform/RoleController.php):
     ```php
     Permission::query()->where('domain', PermissionDomain::PLATFORM->value)->...->get();
     ```
   - School — [`app/Http/Controllers/School/RoleController.php`](../app/Http/Controllers/School/RoleController.php):
     ```php
     Permission::query()->where('domain', PermissionDomain::SCHOOL->value)->...->get();
     ```

2. **The write validation.** The store/update requests reject any permission from the wrong domain:

   - Platform — [`app/Http/Requests/Role/StoreRoleRequest.php`](../app/Http/Requests/Role/StoreRoleRequest.php) and [`UpdateRoleRequest.php`](../app/Http/Requests/Role/UpdateRoleRequest.php):
     ```php
     'permissions.*' => [
         'string',
         Rule::exists('permissions', 'name')
             ->where('domain', PermissionDomain::PLATFORM->value),
     ],
     ```
   - School — [`app/Http/Requests/School/StoreRoleRequest.php`](../app/Http/Requests/School/StoreRoleRequest.php) and [`UpdateRoleRequest.php`](../app/Http/Requests/School/UpdateRoleRequest.php): identical but `PermissionDomain::SCHOOL->value`.

The `PermissionEnum::forDomain()` helper returns every case in a given domain (used by seeders and tests):

```php
PermissionEnum::forDomain(PermissionDomain::SCHOOL); // array<PermissionEnum>
```

---

## 2. Naming convention

Permissions are named `module.action` (dot-separated, lowercase, kebab within a segment). Legacy platform permissions keep bare names (`users.index`, `settings.edit`); **new** platform modules use a `platform.*` prefix. Every school permission starts with `school.`.

| Domain | Name | Group |
|---|---|---|
| platform | `dashboard.view` | Dashboard |
| platform | `users.index` … `users.export`, `users.impersonate` | Users |
| platform | `roles.index` … `roles.export` | Roles |
| platform | `permissions.index`, `permissions.export` | Permissions |
| platform | `platform.schools.*` | Schools |
| platform | `platform.locations.*` | Locations |
| platform | `platform.subscriptions.*` | Subscriptions |
| platform | `platform.learning.*` | Learning |
| platform | `platform.pathways.*` | Pathways |
| platform | `platform.assessments.*` | Assessments |
| platform | `platform.certificates.*` | Certificates |
| platform | `platform.reports.*` | Reports |
| platform | `platform.notifications.*` | Notifications |
| platform | `platform.support.*` | Support Tools |
| platform | `platform.system.*` | System |
| platform | `settings.*` | Settings |
| school | `school.dashboard.view` | Dashboard |
| school | `school.branches.*` | Branches |
| school | `school.locations.index`, `school.locations.view`, `school.locations.export` | Locations |
| school | `school.staff.*` | Staff |
| school | `school.roles.*` | Roles |
| school | `school.courses.*` (incl. publish, assign) | Courses |
| school | `school.library.*` | Library |
| school | `school.pathways.*` | Pathways |
| school | `school.assignments.*` | Assignments |
| school | `school.assessments.*` | Assessments |
| school | `school.certificates.*` | Certificates |
| school | `school.billing.*` | Billing |
| school | `school.reports.*` | Reports |
| school | `school.notifications.*` | Notifications |
| school | `school.settings.*` | Settings |

The `group` (e.g. "Courses", "Billing") is the display grouping used by the role-assignment UI's grouped checkboxes. It comes from `PermissionEnum::group()`.

Every module whose page renders an exportable table carries an `export` action
(`platform.locations.export`, `school.staff.export`, …). The exceptions are
screens with nothing to export: `school.branches.*`, both dashboards, and the
two settings modules. `tests/Feature/PageGatingCoverageTest.php` enforces this.

Teachers/learners stay **permission-free** — the teacher portal is gated by ownership/enrollment checks only, not Spatie permissions.

Keep the TS mirror in sync: `tests/Feature/PermissionParityTest.php` asserts a two-way match between `PermissionEnum` and `resources/js/types/permissions.ts`.

---

## 3. Where a permission lives (backend + frontend)

A permission touches exactly three source-of-truth locations:

| Concern | File | What to add |
|---|---|---|
| Backend enum (name, group, domain) | [`app/Enums/PermissionEnum.php`](../app/Enums/PermissionEnum.php) | a `case`, a `group()` arm, and (if school) a `domain()` arm |
| Database rows | [`database/seeders/PermissionSeeder.php`](../database/seeders/PermissionSeeder.php) | nothing — it iterates `PermissionEnum::cases()` automatically |
| Frontend constant (for `can()` checks) | [`resources/js/types/permissions.ts`](../resources/js/types/permissions.ts) | a key under `PERMISSIONS` |

`PermissionSeeder` writes `name`, `guard_name`, `group`, and `domain` for every enum case using `updateOrCreate`, so re-running it also refreshes metadata on existing rows:

```php
Permission::updateOrCreate(
    ['name' => $permission->value],
    [
        'guard_name' => $permission->guard(),
        'group' => $permission->group(),
        'domain' => $permission->domain()->value,
    ],
);
```

The frontend never queries permission strings directly — it uses the typed `PERMISSIONS` constant in [`resources/js/types/permissions.ts`](../resources/js/types/permissions.ts). The `PermissionKey` union type is derived from that constant, so a new key becomes usable in `can(PERMISSIONS.X.Y)` immediately.

---

## 4. Step-by-step: "I want to add a permission called `X`"

Example: add `school.courses.publish` (a **school**-domain permission).

1. **Add the enum case** in [`app/Enums/PermissionEnum.php`](../app/Enums/PermissionEnum.php):
   ```php
   case SCHOOL_COURSES_PUBLISH = 'school.courses.publish';
   ```

2. **Add it to `group()`** (so the UI groups it):
   ```php
   self::SCHOOL_COURSES_INDEX,
   self::SCHOOL_COURSES_VIEW,
   self::SCHOOL_COURSES_CREATE,
   self::SCHOOL_COURSES_EDIT,
   self::SCHOOL_COURSES_DELETE,
   self::SCHOOL_COURSES_PUBLISH => 'Courses',
   ```

3. **Add it to `domain()`** — required for school permissions (platform ones fall through to the `default`):
   ```php
   self::SCHOOL_COURSES_PUBLISH,
   // ... alongside the other school cases ...
   => PermissionDomain::SCHOOL,
   ```

4. **Mirror it in the frontend** [`resources/js/types/permissions.ts`](../resources/js/types/permissions.ts):
   ```ts
   SCHOOL_COURSES: {
       INDEX: 'school.courses.index',
       // ...
       PUBLISH: 'school.courses.publish',
   },
   ```

5. **Seed it into the database**:
   ```bash
   php artisan db:seed --class=PermissionSeeder    # or: php artisan migrate:fresh --seed
   ```

6. **Gate something with it** — a route (`->middleware('permission:'.PermissionEnum::SCHOOL_COURSES_PUBLISH->value)`) and/or UI (`can(PERMISSIONS.SCHOOL_COURSES.PUBLISH)`).

7. **Assign it to roles** — via the role-assignment UI, or (for a default) add it to a role's permission set in a seeder.

> A **platform** permission is the same minus step 3 (it falls through `domain()`'s `default => PermissionDomain::PLATFORM`). Name it either bare (`reports.index`) or `platform.*`.

---

## 5. Roles and permission assignment

Roles are dynamic (created at runtime through each dashboard's UI) and **team-scoped**:

- **Platform roles** live in team `0` (the reserved platform team — see §6).
- **School roles** live in team `= school.id`.

### Platform

- Controller: [`app/Http/Controllers/Platform/RoleController.php`](../app/Http/Controllers/Platform/RoleController.php)
- Requests: [`app/Http/Requests/Role/StoreRoleRequest.php`](../app/Http/Requests/Role/StoreRoleRequest.php), [`UpdateRoleRequest.php`](../app/Http/Requests/Role/UpdateRoleRequest.php)
- Roles are listed/created scoped to `where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID)` (i.e. `0`).
- On `store`, `Role::create([...])` runs in the default (platform) team, then `syncPermissions()` attaches the chosen **platform-domain** permissions.

Default platform roles are seeded from [`App\Enums\RoleEnum`](../app/Enums/RoleEnum.php) by [`database/seeders/RoleSeeder.php`](../database/seeders/RoleSeeder.php), which explicitly pins them to the platform team:

```php
$role = Role::firstOrCreate(
    ['name' => $roleEnum->value, 'school_id' => PlatformTeamResolver::PLATFORM_TEAM_ID],
    ['guard_name' => $roleEnum->guard()]
);
```

### School

- Controller: [`app/Http/Controllers/School/RoleController.php`](../app/Http/Controllers/School/RoleController.php)
- Requests: [`app/Http/Requests/School/StoreRoleRequest.php`](../app/Http/Requests/School/StoreRoleRequest.php), [`UpdateRoleRequest.php`](../app/Http/Requests/School/UpdateRoleRequest.php)
- Because the `tenant` middleware has already set the active team to the school, `Role::create(['name' => ..., 'school_id' => $school->id])` produces a role owned by that school, and `syncPermissions()` attaches **school-domain** permissions only.
- Every write also verifies the `{role}` actually belongs to the school (`ensureBelongsToSchool()` → 404 otherwise), so a forged id from another school is rejected.

Default per-school roles (`super-admin`, `admin`, `manager`) are seeded by [`database/seeders/SchoolSeeder.php`](../database/seeders/SchoolSeeder.php), which sets `setPermissionsTeamId($school->id)` before creating them.

> **Branches are not part of the team key.** A school's `manager` role is one role reused by every branch of that school — roles describe what someone may do, and [branches](branches.md) separately decide which records they may do it to. This means a branch manager can legitimately hold a permission like `school.branches.create` through their role; where that would be wrong, an independent gate (`head_office`) refuses them. Never assume a permission check implies a branch check, or vice versa.

### Assigning roles to users

Roles are attached to users with `$user->syncRoles([...])` / `assignRole(...)` inside the platform/school `UserController`. Because assignment records the **current** team id in `model_has_roles.school_id`, the controllers rely on the active team already being correct (platform = `0`, school = set by `tenant`).

---

## 6. Super-admin bypass (`Gate::before` + team id `0`)

### The bypass

All super-admin power flows through a single `Gate::before` hook in
[`app/Providers/AppServiceProvider.php`](../app/Providers/AppServiceProvider.php):

```php
protected function configureSpatiePermissions(): void
{
    Gate::before(function ($user, $ability) {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value) ? true : null;
    });
}
```

Returning `true` grants every ability; returning `null` lets normal permission checks proceed. No route or UI is gated on explicit permissions for a super-admin — they are gated on the `super-admin` **role** via this hook.

### Why it is scoped correctly

`$user->hasRole('super-admin')` is evaluated **in the active team**, so the same hook produces the right result on every dashboard:

- On a **platform** request the active team is `0`, so it checks the platform `super-admin` role → a platform super-admin is all-powerful on the platform dashboard only.
- On a **school** request the `tenant` middleware has set the active team to that school's id, so it checks that school's own `super-admin` role → a school super-admin is all-powerful **within their school only**.
- On a **teacher** request the team is `0` and teachers hold no roles, so the hook returns `null` (no bypass).

### The reserved platform team (`0`)

The active team is resolved by [`App\Support\PlatformTeamResolver`](../app/Support/PlatformTeamResolver.php), configured in [`config/permission.php`](../config/permission.php) (`'team_resolver' => PlatformTeamResolver::class`):

```php
class PlatformTeamResolver extends DefaultTeamResolver
{
    public const PLATFORM_TEAM_ID = 0;

    public function getPermissionsTeamId(): int|string|null
    {
        return parent::getPermissionsTeamId() ?? self::PLATFORM_TEAM_ID;
    }
}
```

When no team has been set (platform + teacher requests, seeders, tests) the platform team `0` is assumed. The `tenant` middleware overrides it with the school id on `/school/{school}/*` routes.

> **Why `0` instead of `NULL`?** Spatie treats a `NULL`-team (global) role as belonging to **every** team, which would make a global `super-admin`/`admin` collide with each school's same-named role (`RoleAlreadyExists`). Giving the platform its own real team (`0`, an id no school can have) keeps the platform and school role sets fully independent.

### Frontend

The same team-aware `hasRole('super-admin')` is shared to the client as `auth.user.is_super_admin` in
[`app/Http/Middleware/HandleInertiaRequests.php`](../app/Http/Middleware/HandleInertiaRequests.php). The `usePermission()` hook short-circuits `can()`/`canAny()`/`canAll()` to `true` when `is_super_admin` is set — see [permission-checks-in-ui.md](permission-checks-in-ui.md).

---

## Related

- [middleware-and-tenancy.md](middleware-and-tenancy.md) — how the active team gets set per request.
- [branches.md](branches.md) — the separate data-scoping layer that deliberately stays out of the team key.
- [permission-checks-in-ui.md](permission-checks-in-ui.md) — using permissions in React.
