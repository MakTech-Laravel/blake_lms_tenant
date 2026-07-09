# Layouts & Dashboards

There are three dashboards — **Platform**, **School**, **Teacher** — plus the starter kit's generic app/auth/settings layouts. Which layout wraps a page is decided **by the page's name**, in one place.

---

## The layout resolver (`app.tsx`)

[`resources/js/app.tsx`](../resources/js/app.tsx) sets a global Inertia `layout` resolver keyed on the page component's name prefix:

```tsx
layout: (name) => {
    switch (true) {
        case name === 'welcome':
            return null;
        case name.startsWith('auth/'):
            return AuthLayout;
        case name.startsWith('platform/'):
            return PlatformLayout;
        case name.startsWith('school/'):
            return SchoolLayout;
        case name.startsWith('teacher/'):
            return TeacherLayout;
        case name.startsWith('settings/'):
            return [AppLayout, SettingsLayout];
        default:
            return AppLayout;
    }
},
```

So a controller that calls `Inertia::render('school/roles/index', …)` is automatically wrapped in `SchoolLayout`. **The page-name prefix is the contract** — there is no per-page layout wiring to maintain.

(The page resolution itself — mapping name → file under `resources/js/pages/` — is handled automatically by the `@inertiajs/vite` plugin; `app.tsx` has no `resolve` callback.)

---

## The three dashboard layouts

Each dashboard has its own layout file, and each renders its own sidebar:

| Dashboard | Layout file | Sidebar file |
|---|---|---|
| Platform | [`resources/js/layouts/platform-layout.tsx`](../resources/js/layouts/platform-layout.tsx) | [`resources/js/components/platform/platform-sidebar.tsx`](../resources/js/components/platform/platform-sidebar.tsx) |
| School | [`resources/js/layouts/school-layout.tsx`](../resources/js/layouts/school-layout.tsx) | [`resources/js/components/school/school-sidebar.tsx`](../resources/js/components/school/school-sidebar.tsx) |
| Teacher | [`resources/js/layouts/teacher-layout.tsx`](../resources/js/layouts/teacher-layout.tsx) | [`resources/js/components/teacher/teacher-sidebar.tsx`](../resources/js/components/teacher/teacher-sidebar.tsx) |

Today all three layout files share the same shell primitives (`AppShell`, `AppContent`, `AppSidebarHeader`) and differ only in which sidebar they mount. For example [`school-layout.tsx`](../resources/js/layouts/school-layout.tsx):

```tsx
export default function SchoolLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <SchoolSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
```

`PlatformLayout` and `TeacherLayout` are structurally identical but mount `PlatformSidebar` / `TeacherSidebar`.

---

## Sidebar nav configs & permission filtering

Each sidebar declares a `NavNode[]` config and renders it with the shared `SidebarNav` component.

**Platform** — [`platform-sidebar.tsx`](../resources/js/components/platform/platform-sidebar.tsx) uses static Wayfinder route helpers and gates items with `permissions`:

```tsx
const mainNav: NavNode[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    {
        title: 'Schools',
        href: platformSchools.index(),
        icon: Building2,
        permissions: [PERMISSIONS.SCHOOLS.INDEX],
    },
    {
        title: 'Access Control',
        icon: ShieldCheck,
        permissions: [PERMISSIONS.USERS.INDEX, PERMISSIONS.ROLES.INDEX, PERMISSIONS.PERMISSIONS.INDEX],
        items: [
            { title: 'Staff', href: platformUsers.index(), icon: Users, permissions: [PERMISSIONS.USERS.INDEX] },
            { title: 'Roles', href: platformRoles.index(), icon: Shield, permissions: [PERMISSIONS.ROLES.INDEX] },
            { title: 'Permissions', href: platformPermissions.index(), icon: KeyRound, permissions: [PERMISSIONS.PERMISSIONS.INDEX] },
        ],
    },
];
```

**School** — [`school-sidebar.tsx`](../resources/js/components/school/school-sidebar.tsx) builds tenant-scoped hrefs from `useTenant()` (the current school), then gates with school-domain permissions:

```tsx
const school = useTenant();
const mainNav: NavNode[] = [
    { title: 'Dashboard', href: dashboard(school.slug), icon: LayoutGrid },
    { title: 'Staff', href: schoolUsers.index(school.slug), icon: Users, permissions: [PERMISSIONS.SCHOOL_STAFF.INDEX] },
    { title: 'Roles', href: schoolRoles.index(school.slug), icon: Shield, permissions: [PERMISSIONS.SCHOOL_ROLES.INDEX] },
    { title: 'Courses', href: schoolCourses.index(school.slug), icon: BookOpen, permissions: [PERMISSIONS.SCHOOL_COURSES.INDEX] },
];
```

**Teacher** — [`teacher-sidebar.tsx`](../resources/js/components/teacher/teacher-sidebar.tsx) is fully static (teachers hold no roles, so **no `permissions` keys**):

```tsx
const mainNav: NavNode[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'My Courses', href: teacherCourses.index(), icon: BookOpen },
    { title: 'Certificates', href: teacherCertificates.index(), icon: Award },
];
```

### How the filtering works

`SidebarNav` ([`resources/js/components/navigation/sidebar-nav.tsx`](../resources/js/components/navigation/sidebar-nav.tsx)) calls `filterNavNodes(items, canAny)` from [`nav-utils.ts`](../resources/js/components/navigation/nav-utils.ts). For each node:

- If it has a `permissions` array, it is dropped unless `canAny(permissions)` is true (**OR** logic — the user needs *any* one of them). `canAny` short-circuits to `true` for super-admins.
- Group nodes recurse; an empty group with no own `href` is dropped.
- Nodes with **no** `permissions` are always shown (this is why the teacher nav renders for everyone).

The `NavNode` shape (title, href, icon, badge, disabled, external, `permissions`, nested `items`, per-slot `classNames`) is defined in [`resources/js/components/navigation/types.ts`](../resources/js/components/navigation/types.ts).

---

## Walkthrough: making the School dashboard a completely separate design

The three dashboards are **already independent files** — editing `school-layout.tsx` affects only `school/*` pages, never Platform or Teacher. They currently *happen* to share shell primitives; nothing forces them to. To redesign School from scratch (say, a top-bar layout with a right-hand drawer instead of the shared left sidebar):

1. **Rewrite the layout body.** Open [`resources/js/layouts/school-layout.tsx`](../resources/js/layouts/school-layout.tsx) and replace its contents entirely. You are not obligated to use `AppShell`, `AppContent`, or `AppSidebarHeader` — they are just the current choice. Keep the component's props (`{ children, breadcrumbs }: AppLayoutProps`) and render `{children}` somewhere.

   ```tsx
   import { SchoolTopbar } from '@/components/school/school-topbar';
   import type { AppLayoutProps } from '@/types';

   export default function SchoolLayout({ children }: AppLayoutProps) {
       return (
           <div className="min-h-screen bg-school-canvas">
               <SchoolTopbar />
               <main className="mx-auto max-w-7xl p-6">{children}</main>
           </div>
       );
   }
   ```

2. **Create school-only shell/chrome components** under `resources/js/components/school/` (e.g. `school-topbar.tsx`, `school-shell.tsx`). Because they live in the school folder and are imported only by `school-layout.tsx`, Platform and Teacher are unaffected. The existing school nav config lives in [`school-sidebar.tsx`](../resources/js/components/school/school-sidebar.tsx) — reuse it, replace it, or move its `mainNav` array into your new chrome.

3. **Nothing changes in `app.tsx`.** The resolver already maps `school/*` → `SchoolLayout`; you're editing what `SchoolLayout` renders, not the mapping.

4. **Optionally give School its own design tokens.** Add school-specific CSS variables/utility classes (e.g. in `resources/css/app.css`) and use them only in the school components, so Platform keeps its look.

5. **Breadcrumbs.** If your new School layout doesn't use `AppSidebarHeader`, decide how to surface `breadcrumbs` (or drop the prop). Note the `Page.layout = { breadcrumbs: [...] }` objects some pages export are currently **inert** (not read anywhere), so breadcrumbs are effectively driven by whatever the layout chooses to render.

The same three steps apply to Platform (`platform-layout.tsx` + `components/platform/`) and Teacher (`teacher-layout.tsx` + `components/teacher/`). Because each dashboard owns a separate layout file and a separate components folder, you can take them in completely different visual directions without any shared-file coordination.

---

## Related

- [permission-checks-in-ui.md](permission-checks-in-ui.md) — gating buttons/sections (not just nav).
- [middleware-and-tenancy.md](middleware-and-tenancy.md) — how `school` reaches `useTenant()`.
