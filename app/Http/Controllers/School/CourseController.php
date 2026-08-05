<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Read-only listing of the current school's courses.
 *
 * No explicit branch filtering is applied for pinned users: Course carries the
 * BelongsToBranch global scope, so `$school->courses()` is already narrowed to
 * their branch. The `branch` query filter is an extra convenience for
 * head-office users, who can see everything.
 */
class CourseController extends Controller
{
    public function index(Request $request, School $school): Response
    {
        $search = trim((string) $request->query('search', ''));
        $isHeadOffice = Auth::user()->isHeadOffice();
        $branchFilter = $isHeadOffice ? (int) $request->query('branch', 0) : 0;

        $courses = $school->courses()
            ->withCount('enrollments')
            ->with('branch:id,name')
            ->when($search !== '', fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->when($branchFilter > 0, fn ($query) => $query->where('courses.branch_id', $branchFilter))
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('school/courses/index', [
            'courses' => $courses,
            'branches' => $isHeadOffice
                ? Branch::where('school_id', $school->id)->orderBy('name')->get(['id', 'name'])
                : [],
            'filters' => [
                'search' => $search,
                'branch' => $branchFilter > 0 ? $branchFilter : null,
            ],
        ]);
    }
}
