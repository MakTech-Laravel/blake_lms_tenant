<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use App\Models\School;
use App\Support\BranchContext;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(School $school): Response
    {
        $branchId = BranchContext::pinnedId();

        // Courses and enrollments need no explicit branch filter: Course carries
        // the BelongsToBranch global scope, which also applies inside the
        // whereHas() subquery below. Staff is filtered explicitly because User
        // deliberately has no global scope.
        return Inertia::render('school/dashboard', [
            'stats' => [
                'staff' => $school->users()->forBranch($branchId)->count(),
                'courses' => $school->courses()->count(),
                'enrollments' => CourseEnrollment::whereHas(
                    'course',
                    fn ($query) => $query->where('school_id', $school->id),
                )->count(),
            ],
        ]);
    }
}
