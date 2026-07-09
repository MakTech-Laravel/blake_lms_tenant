<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Read-only listing of the current school's courses.
 */
class CourseController extends Controller
{
    public function index(Request $request, School $school): Response
    {
        $search = trim((string) $request->query('search', ''));

        $courses = $school->courses()
            ->withCount('enrollments')
            ->when($search !== '', fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('school/courses/index', [
            'courses' => $courses,
            'filters' => ['search' => $search],
        ]);
    }
}
