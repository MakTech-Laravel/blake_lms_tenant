<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\GuardEnum;
use App\Enums\RoleEnum;
use App\Enums\UserType;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'avatar', 'type', 'school_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    public function guardName(): string
    {
        return GuardEnum::WEB->value;
    }

    /**
     * Whether this account holds the super-admin role.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Whether this account belongs to the platform dashboard.
     */
    public function isPlatformStaff(): bool
    {
        return $this->type === UserType::PLATFORM;
    }

    /**
     * Whether this account belongs to a school dashboard.
     */
    public function isSchoolStaff(): bool
    {
        return $this->type === UserType::SCHOOL;
    }

    /**
     * Whether this account is a teacher/student.
     */
    public function isTeacher(): bool
    {
        return $this->type === UserType::TEACHER;
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The school this staff member belongs to. NULL for platform staff and
     * teachers.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Course enrollments held by this teacher.
     */
    public function courseEnrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Courses this teacher is enrolled in, through course_enrollments.
     */
    public function enrolledCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_enrollments')
            ->withPivot(['status', 'progress', 'enrolled_at', 'completed_at'])
            ->withTimestamps();
    }

    /**
     * Certificates earned by this teacher.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'type' => UserType::class,
        ];
    }
}
