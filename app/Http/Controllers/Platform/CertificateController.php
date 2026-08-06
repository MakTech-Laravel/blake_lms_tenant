<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CourseEnrollment;
use App\Services\Certificates\CertificateGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CertificateController extends Controller
{
    public function index(): Response
    {
        $certificates = Certificate::query()
            ->with(['user:id,name', 'course:id,title', 'template:id,name'])
            ->latest('issued_at')
            ->limit(50)
            ->get()
            ->map(fn (Certificate $certificate): array => [
                'id' => $certificate->id,
                'number' => $certificate->certificate_number,
                'holder' => $certificate->user?->name ?? '—',
                'course' => $certificate->course?->title ?? '—',
                'organization' => $certificate->template?->name ?? 'AquaCert',
                'issued' => optional($certificate->issued_at)->toDateString() ?? '—',
                'status' => ucfirst($certificate->status ?? 'valid'),
            ]);

        $templates = CertificateTemplate::query()
            ->where('is_active', true)
            ->orderByDesc('is_default')
            ->get(['id', 'name', 'slug', 'is_default']);

        return Inertia::render('platform/certificates/index', [
            'certificates' => $certificates,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request, CertificateGenerator $generator): RedirectResponse
    {
        $validated = $request->validate([
            'course_enrollment_id' => ['required', 'exists:course_enrollments,id'],
            'certificate_template_id' => ['nullable', 'exists:certificate_templates,id'],
        ]);

        $enrollment = CourseEnrollment::query()->findOrFail($validated['course_enrollment_id']);
        $template = isset($validated['certificate_template_id'])
            ? CertificateTemplate::query()->find($validated['certificate_template_id'])
            : null;

        $generator->issue($enrollment, $template);

        return back()->with('success', 'Certificate issued.');
    }

    public function download(Certificate $certificate): BinaryFileResponse|StreamedResponse
    {
        if (blank($certificate->pdf_path) || ! Storage::disk('local')->exists($certificate->pdf_path)) {
            app(CertificateGenerator::class)->renderFiles($certificate);
            $certificate->refresh();
        }

        return Storage::disk('local')->download(
            $certificate->pdf_path,
            $certificate->certificate_number.'.pdf',
        );
    }
}
