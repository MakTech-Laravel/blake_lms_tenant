<?php

namespace App\Enums;

/**
 * The dashboard an account belongs to.
 *
 * PLATFORM → platform owner/staff. Roles are global (school_id NULL).
 * SCHOOL   → school staff. Roles are team-scoped to their school.
 * TEACHER  → students/teachers. Hold no roles; access derives from enrollments.
 */
enum UserType: string
{
    case PLATFORM = 'platform';
    case SCHOOL = 'school';
    case TEACHER = 'teacher';

    /**
     * Human-readable label for display in the UI.
     */
    public function label(): string
    {
        return match ($this) {
            self::PLATFORM => 'Platform Staff',
            self::SCHOOL => 'School Staff',
            self::TEACHER => 'Teacher',
        };
    }
}
