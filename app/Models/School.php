<?php

namespace App\Models;

use App\Enums\SchoolStatus;
use Database\Factories\SchoolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Billable;

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
 * @property string|null $region
 * @property SchoolStatus $status
 * @property string|null $stripe_id
 * @property string|null $pm_type
 * @property string|null $pm_last_four
 * @property Carbon|null $trial_ends_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class School extends Model
{
    /** @use HasFactory<SchoolFactory> */
    use Billable, HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'region',
        'status',
    ];

    /**
     * Resolve `{school}` route bindings by slug rather than id.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the customer name that should be synced to Stripe.
     */
    public function stripeName(): ?string
    {
        return $this->name;
    }

    /**
     * Get the customer email that should be synced to Stripe.
     */
    public function stripeEmail(): ?string
    {
        return $this->email;
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

    /**
     * Physical branches / locations of this school.
     *
     * Also the relation the `branches.*` routes bind `{branch}` through, since
     * branch slugs are only unique per school.
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    /**
     * The commercial agreement for this organization. At most one.
     */
    public function schoolSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => SchoolStatus::class,
            'trial_ends_at' => 'datetime',
        ];
    }
}
