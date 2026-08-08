<?php

namespace App\Services\Certificates;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\CourseEnrollment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\LaravelPdf\Facades\Pdf;

class CertificateGenerator
{
    /**
     * Issue a certificate for a completed enrollment and persist PDF + PNG preview.
     */
    public function issue(
        CourseEnrollment $enrollment,
        ?CertificateTemplate $template = null,
        ?\DateTimeInterface $expiresAt = null,
    ): Certificate {
        $enrollment->loadMissing(['user', 'course']);

        $template ??= CertificateTemplate::query()
            ->where('is_default', true)
            ->where('is_active', true)
            ->first()
            ?? CertificateTemplate::factory()->default()->create();

        $certificate = Certificate::query()->create([
            'course_enrollment_id' => $enrollment->id,
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'certificate_template_id' => $template->id,
            'certificate_number' => 'AC-'.now()->format('Y').'-'.Str::upper(Str::random(6)),
            'issued_at' => now(),
            'expires_at' => $expiresAt ?? now()->addYears(2),
            'status' => 'valid',
        ]);

        return $this->renderFiles($certificate->fresh(['user', 'course', 'template']));
    }

    /**
     * (Re)generate PDF and PNG files for an existing certificate.
     */
    public function renderFiles(Certificate $certificate): Certificate
    {
        $certificate->loadMissing(['user', 'course', 'template']);

        $view = $certificate->template?->blade_view ?? 'certificates.templates.default';
        $payload = $this->viewData($certificate);

        $directory = 'certificates/'.$certificate->id;
        $pdfRelative = $directory.'/certificate.pdf';
        $pngRelative = $directory.'/preview.png';
        $absolutePdf = Storage::disk('local')->path($pdfRelative);

        Storage::disk('local')->makeDirectory($directory);

        Pdf::view($view, $payload)
            ->driver('dompdf')
            ->landscape()
            ->save($absolutePdf);

        $this->writePreviewPng(
            Storage::disk('local')->path($pngRelative),
            $payload,
        );

        $certificate->forceFill([
            'pdf_path' => $pdfRelative,
            'preview_path' => $pngRelative,
        ])->save();

        return $certificate->refresh();
    }

    /**
     * @return array{recipientName: string, courseTitle: string, certificateNumber: string, issuedAt: string, expiresAt: string}
     */
    public function viewData(Certificate $certificate): array
    {
        return [
            'recipientName' => $certificate->user?->name ?? 'Learner',
            'courseTitle' => $certificate->course?->title ?? 'Course',
            'certificateNumber' => $certificate->certificate_number,
            'issuedAt' => optional($certificate->issued_at)->toFormattedDateString() ?? '—',
            'expiresAt' => optional($certificate->expires_at)->toFormattedDateString() ?? '—',
        ];
    }

    /**
     * Lightweight branded PNG for sharing when Chromium is unavailable.
     *
     * @param  array{recipientName: string, courseTitle: string, certificateNumber: string, issuedAt: string, expiresAt: string}  $payload
     */
    private function writePreviewPng(string $absolutePath, array $payload): void
    {
        if (! function_exists('imagecreatetruecolor')) {
            file_put_contents($absolutePath, base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
            ));

            return;
        }

        $width = 1120;
        $height = 630;
        $image = imagecreatetruecolor($width, $height);
        $navy = imagecolorallocate($image, 3, 38, 78);
        $aqua = imagecolorallocate($image, 10, 177, 185);
        $white = imagecolorallocate($image, 255, 255, 255);
        imagefilledrectangle($image, 0, 0, $width, $height, $navy);
        imagerectangle($image, 24, 24, $width - 25, $height - 25, $aqua);
        imagestring($image, 5, 60, 70, 'AquaCert', $aqua);
        imagestring($image, 5, 60, 140, 'Certificate of Completion', $white);
        imagestring($image, 5, 60, 220, substr($payload['recipientName'], 0, 48), $white);
        imagestring($image, 4, 60, 280, substr($payload['courseTitle'], 0, 60), $aqua);
        imagestring($image, 3, 60, 360, 'No: '.$payload['certificateNumber'], $white);
        imagestring($image, 3, 60, 400, 'Issued: '.$payload['issuedAt'].'  Expires: '.$payload['expiresAt'], $white);
        imagepng($image, $absolutePath);
        imagedestroy($image);
    }
}
