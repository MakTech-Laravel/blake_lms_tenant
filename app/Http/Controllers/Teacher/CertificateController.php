<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\Certificates\CertificateGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            ->map(fn (Certificate $certificate): array => [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'course_title' => $certificate->course?->title,
                'issued_at' => optional($certificate->issued_at)->toDateString(),
                'expires' => optional($certificate->expires_at)->toDateString(),
                'status' => $certificate->status ?? 'valid',
                'has_pdf' => filled($certificate->pdf_path),
                'has_preview' => filled($certificate->preview_path),
            ]);

        return Inertia::render('teacher/certificates/index', [
            'certificates' => $certificates,
        ]);
    }

    public function download(Request $request, Certificate $certificate): BinaryFileResponse|StreamedResponse
    {
        abort_unless($certificate->user_id === $request->user()->id, 403);

        if (blank($certificate->pdf_path) || ! Storage::disk('local')->exists($certificate->pdf_path)) {
            app(CertificateGenerator::class)->renderFiles($certificate);
            $certificate->refresh();
        }

        return Storage::disk('local')->download(
            $certificate->pdf_path,
            $certificate->certificate_number.'.pdf',
        );
    }

    public function preview(Request $request, Certificate $certificate): BinaryFileResponse|StreamedResponse
    {
        abort_unless($certificate->user_id === $request->user()->id, 403);

        if (blank($certificate->preview_path) || ! Storage::disk('local')->exists($certificate->preview_path)) {
            app(CertificateGenerator::class)->renderFiles($certificate);
            $certificate->refresh();
        }

        return Storage::disk('local')->download(
            $certificate->preview_path,
            $certificate->certificate_number.'.png',
        );
    }
}
