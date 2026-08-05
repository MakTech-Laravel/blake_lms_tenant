# Documentation

Developer guides for this multi-tenant teacher-certification platform. Everything here describes the **code as implemented** (verified against the source), not the original design notes.

## Architecture at a glance

Three dashboards share one Laravel app, separated by the account's `type` and (for schools) by a path-based tenant:

| Dashboard | URL | Who | Access model |
|---|---|---|---|
| **Platform** | `/platform/*` | platform owner/staff | roles in the reserved platform team (`0`) |
| **School** | `/school/{school}/*` | school staff | roles team-scoped to their school |
| **Teacher** | `/dashboard`, `/dashboard/*` | students/teachers | **no roles** — access derives from enrollments |

Authorization is [`spatie/laravel-permission`](https://spatie.be/docs/laravel-permission) with **Teams** (the "team" is a school), permissions isolated by a `domain` column (`platform` / `school`), and a single `Gate::before` super-admin bypass that is team-aware.

Inside a school there is a **second, independent** scoping layer: **branches**. Roles and permissions answer *what* a user may do (scoped by `school_id` alone); branches answer *which records* they may see (scoped by `branch_id`). The two never mix — `branch_id` is not part of the team key.

## Guides

- **[permissions.md](permissions.md)** — the domain-isolation model, adding a permission (step-by-step), roles & assignment, and the super-admin bypass (`Gate::before` + team id `0`).
- **[branches.md](branches.md)** — the branch data-scoping layer: head office vs pinned users, `BelongsToBranch`, why `User` is the exception, and branch management gates.
- **[middleware-and-tenancy.md](middleware-and-tenancy.md)** — `ResolveTenant`, `EnsureUserType`, and `EnsureHeadOffice`, registration/order, adding protected routes per dashboard, and slug → active-team resolution end to end.
- **[layouts-and-dashboards.md](layouts-and-dashboards.md)** — the `app.tsx` layout resolver, where each dashboard's layout + sidebar live, nav permission-filtering, and how to make a dashboard's layout fully independent.
- **[permission-checks-in-ui.md](permission-checks-in-ui.md)** — `usePermission()`: `can` / `canAny` / `canAll` / `hasRole` / `hasAnyRole`, with real component examples.
- **[project-structure.md](project-structure.md)** — full backend + frontend file map and where new files go.

For setup, tech stack, and seeded login credentials, see the [root README](../README.md).
