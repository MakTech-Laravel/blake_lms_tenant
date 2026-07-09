# Project structure

A map of the multi-tenant, three-dashboard code — where things live and where new files go. Paths are relative to the project root.

---

## Backend (`app/`, `routes/`, `database/`, `config/`)

### Routes (`routes/`)

| File | Purpose | Middleware on the group |
|---|---|---|
| [`routes/web.php`](../routes/web.php) | Root, the universal `GET /dashboard` dispatcher, file-upload demo, and `require`s the others | `['auth', 'verified']` on the dashboard/demo group |
| [`routes/platform.php`](../routes/platform.php) | Platform dashboard (`/platform/*`) | `['auth', 'verified', 'type:platform']` |
| [`routes/school.php`](../routes/school.php) | School dashboard (`/school/{school}/*`) | `['auth', 'verified', 'tenant', 'type:school']` |
| [`routes/teacher.php`](../routes/teacher.php) | Teacher dashboard (`/dashboard/*`) | `['auth', 'verified', 'type:teacher']` |
| [`routes/settings.php`](../routes/settings.php) | Profile / security / appearance settings | `['auth']` / `['auth', 'verified']` |
| [`routes/console.php`](../routes/console.php) | Artisan console routes | — |

### Controllers (`app/Http/Controllers/`)

```
Platform/
  DashboardController.php     # /platform overview (live counts)
  SchoolController.php        # schools (tenants) list
  UserController.php          # platform staff CRUD
  RoleController.php          # platform role CRUD (platform-domain perms)
  PermissionController.php    # platform permission listing + export
School/
  DashboardController.php     # /school/{school} overview
  UserController.php          # school staff CRUD (tenant-scoped)
  RoleController.php          # school role CRUD (school-domain perms)
  CourseController.php        # school courses list
Teacher/
  DashboardController.php     # __invoke: dispatches by user type; renders teacher dashboard
  CourseController.php        # the teacher's own enrollments
  CertificateController.php   # the teacher's own certificates
FileUploadDemoController.php  # starter-kit demo
PostAttachmentController.php  # starter-kit demo
Settings/…                    # profile & security
```

### Middleware (`app/Http/Middleware/`)

- [`ResolveTenant.php`](../app/Http/Middleware/ResolveTenant.php) — alias `tenant`; resolves `{school}` slug → active Spatie team.
- [`EnsureUserType.php`](../app/Http/Middleware/EnsureUserType.php) — alias `type`; guards routes by `users.type`.
- [`HandleInertiaRequests.php`](../app/Http/Middleware/HandleInertiaRequests.php) — shares `auth.user` (roles/permissions/`is_super_admin`) and the current `school`.
- `HandleAppearance.php` — starter-kit light/dark handling.

Aliases + priority are registered in [`bootstrap/app.php`](../bootstrap/app.php).

### Models (`app/Models/`)

| Model | Notes |
|---|---|
| [`User.php`](../app/Models/User.php) | `type` (UserType cast) + `school_id`; `isPlatformStaff()/isSchoolStaff()/isTeacher()/isSuperAdmin()`; relations `school()`, `courseEnrollments()`, `enrolledCourses()`, `certificates()`; `HasRoles`. |
| [`School.php`](../app/Models/School.php) | Tenant. `getRouteKeyName() = 'slug'`; relations `users()`, `courses()`. |
| [`Course.php`](../app/Models/Course.php) | `belongsTo(School)`, `enrollments()`, `teachers()`, `certificates()`. |
| [`CourseEnrollment.php`](../app/Models/CourseEnrollment.php) | `belongsTo(Course)`, `belongsTo(User)`, `hasOne(Certificate)`. |
| [`Certificate.php`](../app/Models/Certificate.php) | `belongsTo(CourseEnrollment/User/Course)`. |
| `Post.php`, `Attachment.php` | starter-kit file-upload demo. |

### Enums (`app/Enums/`)

- [`PermissionEnum.php`](../app/Enums/PermissionEnum.php) — every permission + `group()`, `domain()`, `forDomain()`.
- [`PermissionDomain.php`](../app/Enums/PermissionDomain.php) — `platform` / `school`.
- [`RoleEnum.php`](../app/Enums/RoleEnum.php) — default role names + their platform permission sets (`super-admin`, `admin`, `manager`, `editor`, `author`, `viewer`, `user`).
- [`UserType.php`](../app/Enums/UserType.php) — `platform` / `school` / `teacher` + `label()`.
- [`GuardEnum.php`](../app/Enums/GuardEnum.php) — `web`.

### Support & providers

- [`app/Support/PlatformTeamResolver.php`](../app/Support/PlatformTeamResolver.php) — reserved platform team `0`; wired via [`config/permission.php`](../config/permission.php).
- [`app/Support/SuperAdmin.php`](../app/Support/SuperAdmin.php) — super-admin invariants (count / isLast / isGrantedBy), all team-aware.
- [`app/Providers/AppServiceProvider.php`](../app/Providers/AppServiceProvider.php) — the `Gate::before` super-admin bypass.
- [`app/Policies/UserPolicy.php`](../app/Policies/UserPolicy.php) — only a super-admin may modify/delete a super-admin.

### Form requests (`app/Http/Requests/`)

```
Role/    StoreRoleRequest.php, UpdateRoleRequest.php    # platform-domain isolation
School/  StoreRoleRequest.php, UpdateRoleRequest.php,   # school-domain isolation
         StoreUserRequest.php, UpdateUserRequest.php    # school role scoping + super-admin rules
User/    StoreUserRequest.php, UpdateUserRequest.php    # platform user rules
Settings/…
```

### Migrations (`database/migrations/`)

**One table per file.** Edited-in-place starter/package migrations:
- `0001_01_01_000000_create_users_table.php` — added `type` + `school_id`.
- `2026_05_30_105200_create_permission_tables.php` — Spatie; the `school_id` team column is generated from `config/permission.php`.
- `2026_05_30_111535_add_group_to_permissions_table.php` — added `group` **and** `domain`.

New tenant tables (one each): `create_schools_table`, `create_courses_table`, `create_course_enrollments_table`, `create_certificates_table` (the `2026_07_09_*` files).

### Seeders (`database/seeders/`)

Run in this order by [`DatabaseSeeder.php`](../database/seeders/DatabaseSeeder.php):

1. [`PermissionSeeder.php`](../database/seeders/PermissionSeeder.php) — all permissions (name/group/domain).
2. [`RoleSeeder.php`](../database/seeders/RoleSeeder.php) — global platform roles (team `0`).
3. [`UserSeeder.php`](../database/seeders/UserSeeder.php) — platform staff.
4. [`SchoolSeeder.php`](../database/seeders/SchoolSeeder.php) — 2 schools + per-school roles + staff.
5. [`CourseSeeder.php`](../database/seeders/CourseSeeder.php) — courses per school.
6. [`TeacherSeeder.php`](../database/seeders/TeacherSeeder.php) — teachers + enrollments + certificates.

Factories live in `database/factories/` (incl. `SchoolFactory`, `CourseFactory`, `CourseEnrollmentFactory`, `CertificateFactory`, and the `UserFactory` states `platform()`, `schoolStaff($school)`, `teacher()`).

---

## Frontend (`resources/js/`)

### Pages (`resources/js/pages/`)

The folder mirrors the Inertia component name, and the name prefix drives the layout (see [layouts-and-dashboards.md](layouts-and-dashboards.md)).

```
platform/
  dashboard.tsx
  schools/index.tsx
  users/{index,create,edit,show}.tsx
  roles/{index,create,edit}.tsx
  permissions/index.tsx
school/
  dashboard.tsx
  courses/index.tsx
  users/{index,create,edit,show}.tsx
  roles/{index,create,edit}.tsx
teacher/
  dashboard.tsx
  courses/index.tsx
  certificates/index.tsx
auth/…, settings/…, welcome.tsx     # starter kit
```

### Layouts (`resources/js/layouts/`)

`platform-layout.tsx`, `school-layout.tsx`, `teacher-layout.tsx` (one per dashboard) plus the starter `app-layout.tsx`, `auth-layout.tsx`, `settings/`. The resolver is in [`resources/js/app.tsx`](../resources/js/app.tsx).

### Per-dashboard nav (`resources/js/components/{platform,school,teacher}/`)

- `platform/platform-sidebar.tsx`, `school/school-sidebar.tsx`, `teacher/teacher-sidebar.tsx` — each holds a `NavNode[]` config.
- Shared nav rendering + filtering: [`resources/js/components/navigation/`](../resources/js/components/navigation/) (`sidebar-nav.tsx`, `nav-node.tsx`, `nav-utils.ts`, `types.ts`).
- Reusable CRUD components (used by both platform and school pages): [`resources/js/components/admin/`](../resources/js/components/admin/) (`user-form.tsx`, `role-form.tsx`, `permission-selector.tsx`, `data-pagination.tsx`, `confirm-delete-dialog.tsx`, `admin-page-header.tsx`).
- Shared metric tile: `resources/js/components/dashboard/stat-card.tsx`.

### Hooks & types

- [`resources/js/hooks/use-permissions.tsx`](../resources/js/hooks/use-permissions.tsx) — `usePermission()`.
- [`resources/js/hooks/use-tenant.ts`](../resources/js/hooks/use-tenant.ts) — `useTenant()` (current school).
- [`resources/js/types/permissions.ts`](../resources/js/types/permissions.ts) — `PERMISSIONS` constant + `PermissionKey`.
- [`resources/js/types/tenant.ts`](../resources/js/types/tenant.ts) — `Tenant`; wired into shared props in `types/global.d.ts`.
- `resources/js/types/admin.ts` — shared CRUD types (`Paginated`, `AdminUser`, `RoleRef`, `PermissionOption`, …).

### Generated route helpers (`resources/js/routes/`)

Wayfinder output — **generated, do not edit by hand.** `routes/platform/*`, `routes/school/*`, `routes/teacher/*`, etc. Regenerate with `pnpm run build` (the Vite plugin), never `php artisan wayfinder:generate`.

---

## Where new files go

| I want to add… | Backend | Frontend |
|---|---|---|
| **A platform page** | route in [`routes/platform.php`](../routes/platform.php) (`permission:` gated) + controller in `app/Http/Controllers/Platform/` rendering `platform/…` | page in `resources/js/pages/platform/`; nav item in `components/platform/platform-sidebar.tsx` |
| **A school page** | route in [`routes/school.php`](../routes/school.php) (`permission:` gated) + controller in `app/Http/Controllers/School/` (action receives `School $school`) rendering `school/…` | page in `resources/js/pages/school/` (thread `useTenant().slug` through route helpers); nav item in `components/school/school-sidebar.tsx` |
| **A teacher page** | route in [`routes/teacher.php`](../routes/teacher.php) (type-gated only) + controller in `app/Http/Controllers/Teacher/` rendering `teacher/…` | page in `resources/js/pages/teacher/`; nav item in `components/teacher/teacher-sidebar.tsx` |
| **A new model** | `php artisan make:model Name -mf` → model in `app/Models/`, migration in `database/migrations/`, factory in `database/factories/` | — |
| **A new migration** | `php artisan make:migration create_x_table` → `database/migrations/` (one table per file). Re-run with `php artisan migrate:fresh --seed` | — |
| **A new seeder** | `php artisan make:seeder XSeeder` → `database/seeders/`, then register it in `DatabaseSeeder::run()` in the correct order | — |
| **A new permission** | see the step-by-step in [permissions.md](permissions.md#4-step-by-step-i-want-to-add-a-permission-called-x) | mirror in `resources/js/types/permissions.ts` |

After any backend route change the frontend links to, run `pnpm run build` (or `pnpm run dev`) to regenerate the Wayfinder route helpers.
