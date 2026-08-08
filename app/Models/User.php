<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\GuardEnum;
use App\Enums\RoleEnum;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\Concerns\ReceivesNotifications;
use App\Support\BranchContext;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'avatar', 'type', 'status', 'school_id', 'branch_id', 'last_login_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, ReceivesNotifications, TwoFactorAuthenticatable;

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

    /**
     * Whether this account is disabled in the people directory.
     */
    public function isDisabled(): bool
    {
        return $this->status === UserStatus::Disabled;
    }

    /**
     * Display role for Platform People / Platform Staff tables.
     * Teachers use a fixed Instructor label (no Spatie roles).
     */
    public function directoryRoleLabel(): string
    {
        if ($this->isTeacher()) {
            return 'Instructor';
        }

        return $this->roles->first()?->name ?? 'Staff';
    }

    /**
     * Public avatar URL when stored, otherwise null (UI falls back to initials).
     */
    public function avatarUrl(): ?string
    {
        if (blank($this->avatar)) {
            return null;
        }

        return Storage::disk('public')->url($this->avatar);
    }

    /**
     * Initials for avatar fallback (e.g. "SC").
     */
    public function initials(): string
    {
        $parts = preg_split('/\s+/', trim($this->name)) ?: [];

        if (count($parts) === 0) {
            return '?';
        }

        if (count($parts) === 1) {
            return mb_strtoupper(mb_substr($parts[0], 0, 2));
        }

        return mb_strtoupper(
            mb_substr($parts[0], 0, 1).mb_substr($parts[array_key_last($parts)], 0, 1)
        );
    }

    /**
     * Whether this account has school-wide (head-office) access, seeing every
     * branch of its school. A non-null `branch_id` pins the account to a single
     * branch instead.
     */
    public function isHeadOffice(): bool
    {
        return $this->branch_id === null;
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Restrict to users belonging to the current user's branch.
     *
     * Deliberately an explicit local scope rather than a global one: the branch
     * is resolved from the authenticated user, so a global scope on User would
     * make the session guard's retrieveById() depend on the very record it is
     * resolving and recurse indefinitely. Callers opt in per query instead.
     */
    public function scopeForCurrentBranch(Builder $query): void
    {
        $branchId = BranchContext::pinnedId();

        if ($branchId === null) {
            return;
        }

        $query->where($this->qualifyColumn('branch_id'), $branchId);
    }

    /**
     * Narrow to a specific branch, for the optional head-office branch filter.
     */
    public function scopeForBranch(Builder $query, ?int $branchId): void
    {
        if ($branchId === null) {
            return;
        }

        $query->where($this->qualifyColumn('branch_id'), $branchId);
    }

    /**
     * @param  Builder<User>  $query
     */
    public function scopeTeachers(Builder $query): void
    {
        $query->where($this->qualifyColumn('type'), UserType::TEACHER);
    }

    /**
     * @param  Builder<User>  $query
     */
    public function scopePlatformStaff(Builder $query): void
    {
        $query->where($this->qualifyColumn('type'), UserType::PLATFORM);
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Home school / organization. Used by school staff and teachers (home org
     * for the People directory). NULL for platform staff.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Home branch / location. NULL for head-office school staff, platform staff,
     * and teachers without a pinned location.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
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
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'type' => UserType::class,
            'status' => UserStatus::class,
        ];
    }
}
