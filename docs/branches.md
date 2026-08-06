# Branches

A school can have several physical locations — **branches**. A branch decides **which records** a user may see. It never decides **what** they may do; that stays with roles and permissions.

Keeping those two ideas apart is the whole design, so it is worth being blunt about it:

| | Scoped by | Mechanism |
|---|---|---|
| **What you may do** | `school_id` only | Spatie Teams (`school_id` is the team key) |
| **Which records you see** | `branch_id` | Eloquent global scope (`BelongsToBranch`) |

`branch_id` is deliberately **not** part of Spatie's team key. A `manager` role is one role per school, reused by every branch of that school. Adding branches to the team key would have multiplied every role per branch and broken the existing platform/school [permission-domain isolation](permissions.md).

Branch scoping is also **invisible in the URL**. Routes stay `/school/{school}/…`; there is no `/school/{school}/branch/{branch}/…`. Which branch you are in follows from your account, not the address bar.

---

## Head office vs pinned

Every school account is one of two things, decided by a single nullable column:

| `users.branch_id` | Meaning |
|---|---|
| `NULL` | **Head office.** Sees every branch of their school. |
| set | **Pinned.** Sees only that branch's records — never another branch's, even in the same school. |

```php
$user->isHeadOffice();   // branch_id === null
```

In the seeded demo data, Riverside Teacher Institute has three branches (Rangpur, Khulna, Barishal). The school super-admin is head office and sees all three; the Rangpur manager sees Rangpur only, and cannot see Khulna's or Barishal's data even though all three belong to the same school and share the same `manager` role.

---

## The moving parts

| File | Role |
|---|---|
| [`app/Models/Branch.php`](../app/Models/Branch.php) | `belongsTo School`, `hasMany users`/`courses`, routed by `slug` |
| [`app/Support/BranchContext.php`](../app/Support/BranchContext.php) | One place that answers "which branch is the current user pinned to?" |
| [`app/Models/Scopes/BranchScope.php`](../app/Models/Scopes/BranchScope.php) | The global scope — a **no-op** when `pinnedId()` is `null` |
| [`app/Models/Concerns/BelongsToBranch.php`](../app/Models/Concerns/BelongsToBranch.php) | Applies the scope, adds `branch()`, auto-fills `branch_id` on create |
| [`app/Http/Middleware/EnsureHeadOffice.php`](../app/Http/Middleware/EnsureHeadOffice.php) | Alias `head_office` — restricts branch management |

### `BranchScope` is a no-op by default

```php
$branchId = BranchContext::pinnedId();

if ($branchId === null) {
    return; // head office, unauthenticated, seeders, queue workers, console
}

$builder->where($model->qualifyColumn('branch_id'), $branchId);
```

This matters: seeders, queue jobs, and Artisan commands run unauthenticated and must see **everything**. Only a pinned, logged-in user narrows a query.

Note that the scope matches on equality, so a pinned user does **not** see rows with `branch_id = NULL`. On a branch-scoped model, `NULL` means *school-wide*, which is head-office-only by definition.

---

## Adding branch scoping to a model

Two steps.

**1. Add the column** in the model's own migration, next to `school_id`:

```php
$table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
$table->foreignId('branch_id')->nullable()->index();
```

Add the actual foreign key in [`create_branches_table`](../database/migrations/2026_07_09_032215_create_branches_table.php) by appending the table name to its `$branchTables` array. It runs after the other tables and guards the FK behind a non-SQLite check, matching the project's existing convention:

```php
private array $branchTables = ['users', 'courses'];
```

The FK is `nullOnDelete`: deleting a branch demotes its staff to head office and makes its courses school-wide rather than orphaning either. (SQLite, used by the test suite, does not enforce this — it was verified against MySQL.)

**2. Use the trait** and make `branch_id` fillable:

```php
use App\Models\Concerns\BelongsToBranch;

class Course extends Model
{
    use BelongsToBranch;

    protected $fillable = ['school_id', 'branch_id', /* … */];
}
```

You now get, for free:

- filtering by the current user's branch on every query;
- `branch_id` auto-filled from the creating user, so a pinned user cannot create a record outside their own branch;
- `Model::withoutBranchScope()` to deliberately bypass the scope;
- `Model::forBranch($id)` to filter explicitly (a no-op on `null`).

---

## Why `User` is the exception

`User` does **not** use `BelongsToBranch`, and this is not an oversight.

`BranchScope` resolves the current branch from the authenticated user. Putting it on `User` would mean *resolving the authenticated user requires already knowing who the authenticated user is*. `SessionGuard::user()` calls `retrieveById()`, which builds a `User` query, which would fire the scope, which calls `Auth::user()` — unbounded recursion, ending in memory exhaustion.

So `User` gets **local** scopes instead, applied explicitly where wanted:

```php
User::where('school_id', $school->id)->forCurrentBranch()->get();
```

Two tests in [`BranchScopingTest`](../tests/Feature/BranchScopingTest.php) hold this line. Both matter, because `actingAs()` **cannot** catch the bug — it injects the user straight into the guard so `retrieveById()` is never called:

- one drives a real session login, then calls `$this->app['auth']->forgetGuards()` to force the next request to rehydrate the user through `retrieveById()`;
- one calls `Auth::createUserProvider('users')->retrieveById()` directly while a pinned user is acting.

A pinned user must also stay able to load *other* branches' accounts by id — otherwise impersonation, notifications, and any `find()` by id silently break.

Because `User` has no global scope, cross-branch access on staff records is checked explicitly in `UserController::ensureVisible()`, which 404s when a pinned actor reaches for another branch's staff — or for a head-office account.

---

## Managing branches

Branch CRUD lives at `/school/{school}/branches` ([`BranchController`](../app/Http/Controllers/School/BranchController.php)) behind **two independent gates**:

```php
Route::controller(BranchController::class)
    ->middleware('head_office')
    ->scopeBindings()
    ->group(function () {
        Route::get('branches', 'index')->name('branches.index')
            ->middleware('permission:'.PermissionEnum::SCHOOL_BRANCHES_INDEX->value);
        // …
    });
```

Both are required, and neither implies the other:

- `permission:school.branches.*` — does their role grant it?
- `head_office` — are they school-wide?

The second is not redundant. Because roles are shared across a school's branches, a branch manager may genuinely hold `school.branches.create` through their role. Changing the branch structure is a head-office action, so they are still refused.

### `scopeBindings()` is required here

Branch slugs are unique **per school**, not globally, so two schools may each have a `main-campus`. Laravel's default binding would resolve `{branch}` with a global `where('slug', …)->first()` and could return the wrong school's branch. `scopeBindings()` resolves it through `School::branches()` instead.

This was never a data leak — `ensureBelongsToSchool()` would 404 on the mismatch — but without it a school could fail to reach *its own* branch.

### Deleting

`destroy` refuses while staff are still pinned to the branch, because `nullOnDelete` would silently promote them all to head-office access. Deactivating (`is_active = false`) is the non-destructive alternative; [`ResolveTenant`](../app/Http/Middleware/ResolveTenant.php) then locks that branch's staff out of the dashboard entirely.

---

## Validation when assigning staff

A head-office admin picks a branch when creating or editing staff. The rule must be constrained to their own school:

```php
'branch_id' => [
    'nullable',
    'integer',
    Rule::exists('branches', 'id')->where('school_id', $schoolId),
],
```

Without that `where()`, a school admin could pin their own staff into **another tenant's** branch.

For a pinned actor the submitted value is not merely rejected, it is **discarded** — they have no say, and their staff land in their own branch:

```php
return $actor->isHeadOffice() ? $requested : $actor->branch_id;
```

Which is also why a pinned admin cannot promote anyone (including themselves) to head office.

---

## Frontend

[`HandleInertiaRequests`](../app/Http/Middleware/HandleInertiaRequests.php) shares a `branch` prop alongside `school`, consumed by `useBranch()`:

```tsx
const { isHeadOffice, pinned } = useBranch();
```

```ts
interface BranchContext {
    isHeadOffice: boolean;
    pinned: { id: number; name: string; slug: string } | null;
}
```

It costs no extra query — `ResolveTenant` already loaded and validated the relation.

Use it to hide affordances that would be pointless or misleading for a pinned user: the **Branches** nav item, the branch filter on the staff and course lists (they would have exactly one option), and the branch column in those tables.

This is **presentation only**. Every one of those queries is scoped on the server regardless of what the UI renders, and the tests assert that a pinned user passing `?branch=<other>` by hand gets no extra rows.

---

## Tests

| File | Covers |
|---|---|
| [`BranchScopingTest`](../tests/Feature/BranchScopingTest.php) | the global scope, forged ids, auto-fill, the recursion guard, `ResolveTenant` branch validation, dashboard/course scoping, shared props |
| [`School/BranchManagementTest`](../tests/Feature/School/BranchManagementTest.php) | branch CRUD, the two independent gates, per-school slug uniqueness, scoped bindings, delete guards |
| [`School/BranchStaffScopingTest`](../tests/Feature/School/BranchStaffScopingTest.php) | assigning staff to branches, cross-tenant rejection, cross-branch visibility |
| [`BranchSeedingTest`](../tests/Feature/BranchSeedingTest.php) | the seeded demo scenario actually behaves as documented |

---

## Related

- [permissions.md](permissions.md) — the domain/team model that branches deliberately stay out of.
- [middleware-and-tenancy.md](middleware-and-tenancy.md) — `ResolveTenant`, `EnsureUserType`, `EnsureHeadOffice`, and middleware order.
