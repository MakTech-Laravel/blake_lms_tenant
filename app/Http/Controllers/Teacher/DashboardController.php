<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The universal `/dashboard` entry point. Sends platform and school accounts to
 * their own dashboards and renders the teacher dashboard for teachers.
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isPlatformStaff()) {
            return redirect()->route('platform.dashboard');
        }

        if ($user->isSchoolStaff()) {
            return redirect()->route('school.dashboard', $user->school);
        }

        $enrollments = $user->courseEnrollments()->get();

        return Inertia::render('teacher/dashboard', [
            'stats' => [
                'enrolled' => $enrollments->count(),
                'completed' => $enrollments->where('status', 'completed')->count(),
                'certificates' => $user->certificates()->count(),
            ],
        ]);
    }
}
