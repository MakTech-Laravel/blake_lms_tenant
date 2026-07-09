<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A teacher's own course enrollments. Access is derived purely from the
 * enrollments — teachers hold no roles.
 */
class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = $request->user()
            ->courseEnrollments()
            ->with('course:id,title,slug,duration_hours')
            ->latest('id')
            ->get()
            ->map(fn ($enrollment): array => [
                'id' => $enrollment->id,
                'course_title' => $enrollment->course->title,
                'duration_hours' => $enrollment->course->duration_hours,
                'status' => $enrollment->status,
                'progress' => $enrollment->progress,
                'enrolled_at' => $enrollment->enrolled_at,
            ]);

        return Inertia::render('teacher/courses/index', [
            'enrollments' => $enrollments,
        ]);
    }
}
