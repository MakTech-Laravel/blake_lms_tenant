<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\School\StoreBranchRequest;
use App\Http\Requests\School\UpdateBranchRequest;
use App\Models\Branch;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Branch management for the current school.
 *
 * Every route here is additionally gated by the `head_office` middleware, so a
 * branch-pinned user can never reach these actions even if their role grants
 * the `school.branches.*` permissions.
 */
class BranchController extends Controller
{
    public function index(Request $request, School $school): Response
    {
        $search = trim((string) $request->query('search', ''));

        $branches = Branch::query()
            ->where('school_id', $school->id)
            ->withCount(['users', 'courses'])
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('school/branches/index', [
            'branches' => $branches,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(School $school): Response
    {
        return Inertia::render('school/branches/create');
    }

    public function store(StoreBranchRequest $request, School $school): RedirectResponse
    {
        $branch = $request->validated();
        $branch['school_id'] = $school->id;

        Branch::create($branch);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Branch created successfully.']);

        return redirect()->route('school.branches.index', $school);
    }

    public function edit(School $school, Branch $branch): Response
    {
        $this->ensureBelongsToSchool($school, $branch);

        return Inertia::render('school/branches/edit', [
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
                'slug' => $branch->slug,
                'email' => $branch->email,
                'phone' => $branch->phone,
                'address' => $branch->address,
                'is_active' => $branch->is_active,
                'users_count' => $branch->users()->count(),
            ],
        ]);
    }

    public function update(UpdateBranchRequest $request, School $school, Branch $branch): RedirectResponse
    {
        $this->ensureBelongsToSchool($school, $branch);

        $branch->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Branch updated successfully.']);

        return redirect()->route('school.branches.index', $school);
    }

    public function destroy(School $school, Branch $branch): RedirectResponse
    {
        $this->ensureBelongsToSchool($school, $branch);

        // Staff pinned to this branch would silently be promoted to head-office
        // (school-wide) access by the nullOnDelete foreign key, so require them
        // to be reassigned first. Deactivating is the non-destructive option.
        $staffCount = $branch->users()->count();

        if ($staffCount > 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Reassign the {$staffCount} staff account(s) pinned to this branch before deleting it, or deactivate the branch instead.",
            ]);

            return redirect()->back();
        }

        $branch->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Branch deleted successfully.']);

        return redirect()->back();
    }

    /**
     * Guard against operating on another school's branch via a forged slug.
     *
     * The route group also uses scoped bindings, which resolve `{branch}`
     * through the school's own relation; this stays as a second line of defence
     * because branch slugs are only unique per school.
     */
    private function ensureBelongsToSchool(School $school, Branch $branch): void
    {
        abort_unless($branch->school_id === $school->id, 404);
    }
}
