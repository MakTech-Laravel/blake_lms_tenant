# Teacher Certification Platform

A multi-tenant LMS for teacher certification, built as a single Laravel + Inertia + React application serving **three distinct dashboards** — Platform, School, and Teacher — with path-based tenancy and domain-isolated role-based access control.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Runtime | PHP | 8.4 |
| Framework | `laravel/framework` | 13.19 |
| SPA bridge | `inertiajs/inertia-laravel` / `@inertiajs/react` | v3 |
| Auth backend | `laravel/fortify` | 1.37 |
| Authorization | `spatie/laravel-permission` (Teams enabled) | ^7.4 |
| Typed routes | `laravel/wayfinder` + `@laravel/vite-plugin-wayfinder` | 0.1.x |
| Exports | `maatwebsite/excel` | ^3.1 |
| Debugging | `laravel/telescope`, `laravel/pail` | 5.20 / 1.2 |
| UI | React | 19.2 |
| Styling | Tailwind CSS | v4 |
| Build | Vite | v8 |
| Language | TypeScript | ^5.7 |
| Lint/format | ESLint 9, Prettier 3, Laravel Pint 1.29 | — |
| Tests | Pest 4 / PHPUnit 12 | — |
| Package managers | Composer + **pnpm** | — |

> This project uses **pnpm**, not npm. Use `pnpm …` for all JS tooling.

---

## Three-dashboard architecture

One codebase, three dashboards separated by the account's `type` (and, for schools, by tenant):

| Dashboard | URL pattern | Audience | Authorization |
|---|---|---|---|
| **Platform** | `platform.com/platform/*` | platform owner/staff (super-admin, admin, manager) | roles in the reserved **platform team (`0`)** |
| **School** | `platform.com/school/{school}/*` | school staff (each school defines its own roles) | roles **team-scoped to their school** |
| **Teacher** | `platform.com/dashboard`, `platform.com/dashboard/*` | students/teachers | **no roles** — access derives from course enrollments |

Authorization uses `spatie/laravel-permission` with the **Teams** feature, where a "team" is a **school**. Permissions carry a `domain` (`platform` / `school`) so the two staff dashboards' permission sets are fully isolated. A single team-aware `Gate::before` grants each super-admin unconditional power **within their own scope only** (platform super-admin over the platform, school super-admin over their school).

`EnsureUserType` middleware keeps the three dashboards mutually exclusive; `GET /dashboard` is a universal entry point that redirects each account to its home dashboard.

### Path-based tenancy

Tenancy is **path-based, never subdomain-based** — there is no `Route::domain()` or Host-header logic anywhere. The tenant is the `{school}` **slug** in the URL path. On every `/school/{school}/*` request, the `ResolveTenant` middleware:

1. reads the slug from the route path,
2. loads the `School` (404 if unknown, 403 if inactive or not the user's school),
3. sets Spatie's **active team** to that school, so all role/permission checks are automatically scoped to it.

See [docs/middleware-and-tenancy.md](docs/middleware-and-tenancy.md) for the full flow.

---

## Getting started

### Requirements

- PHP 8.4, Composer
- Node 20+ and **pnpm**
- MySQL 8 (or compatible)

### Install

```bash
# 1. Install dependencies
composer install
pnpm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Configure the database in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_PORT), then:
php artisan migrate:fresh --seed

# 4. Build assets (or use the dev server below)
pnpm run build
```

### Run the app

```bash
# Option A — everything at once (server + queue + Vite):
composer run dev

# Option B — separately:
php artisan serve
pnpm run dev
```

Then open the app, log in with a seeded account, and you'll be routed to the right dashboard automatically (`GET /dashboard` dispatches by account type).

### Seeded login credentials

`php artisan migrate:fresh --seed` creates demo accounts. **For every seeded user the password is the same as the email address.**

**Platform** (`/platform`)

| Role | Email (= password) |
|---|---|
| Super Admin | `superadmin@dev.com` |
| Admin | `admin@dev.com` |
| Manager | `manager@dev.com` |

**Schools** (`/school/{slug}`) — two schools, `riverside-teacher-institute` and `summit-education-academy`

| Role | School 1 (Riverside) | School 2 (Summit) |
|---|---|---|
| Super Admin | `school.superadmin1@dev.com` | `school.superadmin2@dev.com` |
| Admin | `school.admin1@dev.com` | `school.admin2@dev.com` |
| Manager | `school.manager1@dev.com` | `school.manager2@dev.com` |

**Teachers** (`/dashboard`)

| Email (= password) |
|---|
| `teacher1@dev.com` |
| `teacher2@dev.com` |

Example: sign in as `school.superadmin1@dev.com` and visit `/school/riverside-teacher-institute`.

---

## Quality checks

```bash
vendor/bin/pint          # PHP formatting (Laravel Pint)
pnpm run lint:check      # ESLint
pnpm run types:check     # TypeScript (tsc --noEmit)
pnpm run build           # Vite production build (also regenerates Wayfinder routes)
php artisan test         # Pest / PHPUnit suite
```

> Regenerate typed route helpers with `pnpm run build` (the Wayfinder Vite plugin) — **not** `php artisan wayfinder:generate`, which omits the `.form` variants the frontend relies on.

---

## Documentation

Detailed developer guides live in [`docs/`](docs/README.md):

- [Permissions](docs/permissions.md) — domain isolation, adding permissions, roles & assignment, super-admin bypass.
- [Middleware & tenancy](docs/middleware-and-tenancy.md) — `ResolveTenant` / `EnsureUserType`, adding routes, slug → active-team resolution.
- [Layouts & dashboards](docs/layouts-and-dashboards.md) — layout resolver, per-dashboard sidebars, independent redesigns.
- [Permission checks in the UI](docs/permission-checks-in-ui.md) — `usePermission()` helpers with real examples.
- [Project structure](docs/project-structure.md) — full file map and where new files go.
