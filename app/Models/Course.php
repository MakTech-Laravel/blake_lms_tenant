<?php

namespace App\Models;

use App\Models\Concerns\BelongsToBranch;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Course
 * ─────────────────────────────────────────────────────────────────────────────
 * A certification course offered by a school. Teachers enrol in courses via
 * course_enrollments.
 *
 * Branch-scoped: a branch-pinned user only ever sees their own branch's
 * courses, enforced by the BelongsToBranch global scope. A NULL `branch_id`
 * marks a school-wide course, visible to head-office users only.
 *
 * @property int $id
 * @property int $school_id
 * @property int|null $branch_id
 * @property string $title
 * @property string $slug
 * @property string|null $description
 * @property int|null $duration_hours
 * @property string $price
 * @property bool $is_published
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use BelongsToBranch, HasFactory;

    protected $fillable = [
        'school_id',
        'branch_id',
        'title',
        'slug',
        'description',
        'duration_hours',
        'price',
        'is_published',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The school that owns this course.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Enrollments for this course.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Teachers enrolled in this course, through course_enrollments.
     */
    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_enrollments')
            ->withPivot(['status', 'progress', 'enrolled_at', 'completed_at'])
            ->withTimestamps();
    }

    /**
     * Certificates issued for this course.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_hours' => 'integer',
            'price' => 'decimal:2',
            'is_published' => 'boolean',
        ];
    }
}
