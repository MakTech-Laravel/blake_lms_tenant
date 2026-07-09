<?php

namespace App\Models;

use Database\Factories\CourseEnrollmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * CourseEnrollment
 * ─────────────────────────────────────────────────────────────────────────────
 * Links a teacher to a course. A teacher's access to course content is derived
 * from these rows — teachers hold no roles.
 *
 * @property int $id
 * @property int $course_id
 * @property int $user_id
 * @property string $status
 * @property int $progress
 * @property Carbon|null $enrolled_at
 * @property Carbon|null $completed_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class CourseEnrollment extends Model
{
    /** @use HasFactory<CourseEnrollmentFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'user_id',
        'status',
        'progress',
        'enrolled_at',
        'completed_at',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The course this enrollment is for.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * The teacher who is enrolled.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The certificate issued for this enrollment, if any.
     */
    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'progress' => 'integer',
            'enrolled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
