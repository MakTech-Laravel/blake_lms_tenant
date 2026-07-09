<?php

namespace App\Models;

use Database\Factories\SchoolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * School
 * ─────────────────────────────────────────────────────────────────────────────
 * A tenant. Schools are the "teams" in Spatie's Teams feature: staff roles are
 * scoped to a school via the `school_id` team foreign key. Resolved from the
 * `{school}` route segment by its slug.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $address
 * @property bool $is_active
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class School extends Model
{
    /** @use HasFactory<SchoolFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'is_active',
    ];

    /**
     * Resolve `{school}` route bindings by slug rather than id.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Staff accounts belonging to this school.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Courses offered by this school.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
