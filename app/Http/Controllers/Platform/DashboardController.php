<?php

namespace App\Http\Controllers\Platform;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\School;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('platform/dashboard', [
            'stats' => [
                'schools' => School::count(),
                'staff' => User::where('type', UserType::PLATFORM)->count(),
                'courses' => Course::count(),
                'teachers' => User::where('type', UserType::TEACHER)->count(),
            ],
        ]);
    }
}
