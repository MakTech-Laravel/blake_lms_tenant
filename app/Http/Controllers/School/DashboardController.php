<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use App\Models\School;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(School $school): Response
    {
        return Inertia::render('school/dashboard', [
            'stats' => [
                'staff' => $school->users()->count(),
                'courses' => $school->courses()->count(),
                'enrollments' => CourseEnrollment::whereHas(
                    'course',
                    fn ($query) => $query->where('school_id', $school->id),
                )->count(),
            ],
        ]);
    }
}
