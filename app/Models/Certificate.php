<?php

namespace App\Models;

use Database\Factories\CertificateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Certificate
 * ─────────────────────────────────────────────────────────────────────────────
 * Proof that a teacher completed a course. Denormalises user_id and course_id
 * alongside the enrollment for straightforward lookups on the teacher dashboard.
 *
 * @property int $id
 * @property int $course_enrollment_id
 * @property int $user_id
 * @property int $course_id
 * @property int|null $certificate_template_id
 * @property string $certificate_number
 * @property Carbon $issued_at
 * @property Carbon|null $expires_at
 * @property string $status
 * @property string|null $pdf_path
 * @property string|null $preview_path
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Certificate extends Model
{
    /** @use HasFactory<CertificateFactory> */
    use HasFactory;

    protected $fillable = [
        'course_enrollment_id',
        'user_id',
        'course_id',
        'certificate_template_id',
        'certificate_number',
        'issued_at',
        'expires_at',
        'status',
        'pdf_path',
        'preview_path',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The enrollment this certificate was issued for.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CourseEnrollment::class, 'course_enrollment_id');
    }

    /**
     * The teacher who earned the certificate.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The course the certificate is for.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * The layout template used to render this certificate.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'certificate_template_id');
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
