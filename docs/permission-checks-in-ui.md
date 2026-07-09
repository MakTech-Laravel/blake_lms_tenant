# Permission checks in the UI

All client-side authorization goes through one hook: **`usePermission()`** in
[`resources/js/hooks/use-permissions.tsx`](../resources/js/hooks/use-permissions.tsx). It reads the flat arrays shared by the backend (`auth.user.roles`, `auth.user.permissions`, `auth.user.is_super_admin` — see [`HandleInertiaRequests`](../app/Http/Middleware/HandleInertiaRequests.php)) and returns five helpers:

```ts
const { can, canAny, canAll, hasRole, hasAnyRole } = usePermission();
```

| Helper | Signature | Logic |
|---|---|---|
| `can` | `can(permission: PermissionKey): boolean` | super-admin **OR** user has that one permission |
| `canAny` | `canAny(permissions: PermissionKey[]): boolean` | super-admin **OR** user has **any** (OR logic) |
| `canAll` | `canAll(permissions: PermissionKey[]): boolean` | super-admin **OR** user has **all** (AND logic) |
| `hasRole` | `hasRole(role: string): boolean` | user has that role by name |
| `hasAnyRole` | `hasAnyRole(roles: string[]): boolean` | user has any of those roles |

Two things to note from the actual implementation:

- `can` / `canAny` / `canAll` **short-circuit to `true` for a super-admin** (`is_super_admin`). This is why super-admins see every gated control without holding explicit permissions.
- `hasRole` / `hasAnyRole` do **not** short-circuit on super-admin — they check the raw `auth.user.roles` array only.

Always pass a `PERMISSIONS.*` constant, never a raw string, so TypeScript catches typos. `PERMISSIONS` is exported from [`resources/js/types/permissions.ts`](../resources/js/types/permissions.ts) (and re-exported from the hook).

Because `is_super_admin` and the permission list are resolved in the **active team** on the server (platform = team `0`, school = the resolved school), these checks are automatically dashboard-correct — a school super-admin's `is_super_admin` is `true` only within their own school.

---

## Gate a single button/section on one permission — `can()`

**Before** (ungated):

```tsx
<Button asChild>
    <Link href={roles.create().url}>
        <Plus className="h-4 w-4" /> Add role
    </Link>
</Button>
```

**After** — the real code from [`resources/js/pages/platform/roles/index.tsx`](../resources/js/pages/platform/roles/index.tsx):

```tsx
const { can } = usePermission();
// ...
{can(PERMISSIONS.ROLES.CREATE) && (
    <Button asChild>
        <Link href={roles.create().url}>
            <Plus className="h-4 w-4" /> Add role
        </Link>
    </Button>
)}
```

The same pattern gates row actions — from the same file, the edit and delete buttons:

```tsx
{can(PERMISSIONS.ROLES.EDIT) && (
    <Button asChild variant="ghost" size="icon">
        <Link href={roles.edit(role.id).url} title="Edit"><Pencil className="h-4 w-4" /></Link>
    </Button>
)}
{can(PERMISSIONS.ROLES.DELETE) && !isSuper && (
    <ConfirmDeleteDialog /* ... */>{/* trash button */}</ConfirmDeleteDialog>
)}
```

And the school equivalent from [`resources/js/pages/school/users/index.tsx`](../resources/js/pages/school/users/index.tsx):

```tsx
{can(PERMISSIONS.SCHOOL_STAFF.CREATE) && (
    <Button asChild>
        <Link href={users.create(slug).url}>
            <Plus className="h-4 w-4" /> Add staff
        </Link>
    </Button>
)}
```

Gating a whole **section** is identical — wrap the JSX block in `{can(...) && ( … )}`.

---

## Multiple permissions — OR (`canAny`) and AND (`canAll`)

### OR — `canAny([...])`

Show something if the user has **any** of several permissions. This is exactly how the sidebar decides whether to show a group. In [`resources/js/components/navigation/sidebar-nav.tsx`](../resources/js/components/navigation/sidebar-nav.tsx):

```tsx
const { canAny } = usePermission();
const visible = useMemo(() => filterNavNodes(items, canAny), [items]);
```

…and a nav group declares its permissions as an OR set (from [`platform-sidebar.tsx`](../resources/js/components/platform/platform-sidebar.tsx)):

```tsx
{
    title: 'Access Control',
    permissions: [PERMISSIONS.USERS.INDEX, PERMISSIONS.ROLES.INDEX, PERMISSIONS.PERMISSIONS.INDEX],
    items: [ /* … */ ],
}
```

The group renders if the user can reach **any** of Users, Roles, or Permissions. To use it directly in a component:

```tsx
const { canAny } = usePermission();

{canAny([PERMISSIONS.USERS.INDEX, PERMISSIONS.ROLES.INDEX]) && (
    <AccessControlPanel />
)}
```

### AND — `canAll([...])`

Show something only if the user has **every** listed permission:

```tsx
const { canAll } = usePermission();

{canAll([PERMISSIONS.SCHOOL_BILLING.VIEW, PERMISSIONS.SCHOOL_BILLING.EXPORT]) && (
    <ExportInvoicesButton />
)}
```

> `canAll` is available from the hook but is not currently used by any shipped component; the snippet above is the intended usage.

### Choosing between them

- One permission → `can(...)`.
- "Any of these unlocks it" → `canAny([...])`.
- "Needs all of these" → `canAll([...])`.

---

## Gate on a role instead of a permission — `hasRole()` / `hasAnyRole()`

Prefer permissions for features. Use a role check only for genuinely role-specific UI. Real example from [`resources/js/pages/welcome.tsx`](../resources/js/pages/welcome.tsx):

```tsx
const { can, hasRole } = usePermission();
// ...
{hasRole('admin') && (
    <Button /* admin-only action */ />
)}
{can(PERMISSIONS.POSTS.DELETE) && (
    <Button /* permission-gated action */ />
)}
```

Multiple roles:

```tsx
const { hasAnyRole } = usePermission();

{hasAnyRole(['admin', 'manager']) && <TeamTools />}
```

Remember roles are dynamic strings (no typed constant) and `hasRole`/`hasAnyRole` are **not** super-admin-aware — a super-admin who literally holds neither `admin` nor `manager` will get `false` here. If you want "super-admin OR this role", combine the checks or (better) gate on a permission that the super-admin's `Gate::before` already satisfies server-side.

---

## Reading super-admin status directly

Some list pages need the actor's super-admin status to decide row-level rules (e.g. only a super-admin may edit another super-admin). They read the shared prop directly — from [`resources/js/pages/platform/users/index.tsx`](../resources/js/pages/platform/users/index.tsx):

```tsx
const actorIsSuperAdmin = usePage().props.auth.user?.is_super_admin ?? false;
```

---

## Server-side is the source of truth

UI gating is for **UX** (hiding controls the user can't use). Every gated action is **also** protected on the server by the route's `permission:` middleware and/or the controller's policy checks (see [middleware-and-tenancy.md](middleware-and-tenancy.md) and [permissions.md](permissions.md)). Never rely on the client check alone.
