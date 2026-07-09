<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A teacher's earned certificates.
 */
class CertificateController extends Controller
{
    public function index(Request $request): Response
    {
        $certificates = $request->user()
            ->certificates()
            ->with('course:id,title')
            ->latest('issued_at')
            ->get()
            ->map(fn ($certificate): array => [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'course_title' => $certificate->course->title,
                'issued_at' => $certificate->issued_at,
            ]);

        return Inertia::render('teacher/certificates/index', [
            'certificates' => $certificates,
        ]);
    }
}
