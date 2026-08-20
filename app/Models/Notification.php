<?php

namespace App\Models;

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use Carbon\CarbonInterface;
use Database\Factories\NotificationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Notification
 * ─────────────────────────────────────────────────────────────────────────────
 * One authored broadcast: its content, who it is addressed to, and where it sits
 * in the send lifecycle. Exactly one row per announcement no matter how many
 * people receive it; the per-recipient state lives on the notification_user
 * pivot (see NotificationRecipient).
 *
 * The audience is stored as a mode plus a payload of ids rather than a resolved
 * list, so a draft can be re-targeted freely. Resolution into actual users
 * happens once, at send time, in AudienceResolver.
 *
 * This is deliberately not Laravel's DatabaseNotification. The framework's
 * database channel is unused here (no morph columns exist on this table); the
 * Notifiable trait remains on User only because Fortify's password-reset and
 * email-verification mail rides on it.
 *
 * @property int $id
 * @property int|null $school_id
 * @property int|null $created_by
 * @property string $title
 * @property string $body
 * @property NotificationCategory $category
 * @property NotificationPriority $priority
 * @property string|null $action_label
 * @property string|null $action_url
 * @property array<int, string> $channels
 * @property NotificationAudience $audience_type
 * @property array<string, mixed>|null $audience
 * @property string $audience_label
 * @property NotificationStatus $status
 * @property Carbon|null $scheduled_at
 * @property Carbon|null $sent_at
 * @property int $recipients_count
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class Notification extends Model
{
    /** @use HasFactory<NotificationFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Recipients are written in batches of this size so a broadcast to every
     * user never builds one enormous insert.
     */
    public const FANOUT_CHUNK = 500;

    protected $fillable = [
        'school_id',
        'created_by',
        'title',
        'body',
        'category',
        'priority',
        'action_label',
        'action_url',
        'channels',
        'audience_type',
        'audience',
        'audience_label',
        'status',
        'scheduled_at',
        'sent_at',
        'recipients_count',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The organization that authored this, or NULL for platform announcements.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * The staff member who wrote it. NULL once that account is deleted.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Per-recipient delivery rows. Soft-delete aware, so recipients who removed
     * their copy drop out. Use `withTrashed()` when auditing what was actually
     * delivered rather than what is still visible.
     */
    public function receipts(): HasMany
    {
        return $this->hasMany(NotificationRecipient::class);
    }

    /**
     * The people who hold a copy, with their read state attached.
     */
    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_user')
            ->using(NotificationRecipient::class)
            ->withPivot(['id', 'read_at', 'archived_at', 'emailed_at', 'deleted_at'])
            ->withTimestamps();
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    /**
     * Whether the content and audience can still be changed.
     */
    public function isEditable(): bool
    {
        return $this->status->isEditable();
    }

    /**
     * Whether "Send now" applies right now.
     */
    public function isSendable(): bool
    {
        return $this->status->isSendable();
    }

    /**
     * Whether a school authored this, as opposed to the platform.
     */
    public function isSchoolComposed(): bool
    {
        return $this->school_id !== null;
    }

    /**
     * Whether email was requested alongside the in-app copy.
     */
    public function sendsEmail(): bool
    {
        return in_array(NotificationChannel::Mail->value, $this->channels, true);
    }

    /**
     * The ids this audience mode targets, or an empty list for the modes that
     * carry no payload.
     *
     * @return array<int, int>
     */
    public function audienceIds(): array
    {
        $key = $this->audience_type->selectionKey();

        if ($key === null) {
            return [];
        }

        $ids = $this->audience[$key] ?? [];

        if (! is_array($ids)) {
            return [];
        }

        return array_values(array_map(fn (mixed $id): int => (int) $id, $ids));
    }

    /**
     * Trimmed body for the list row, which shows one line.
     */
    public function excerpt(int $limit = 120): string
    {
        return Str::limit(trim(preg_replace('/\s+/', ' ', $this->body) ?? ''), $limit);
    }

    /**
     * How many recipients have opened it. Counts people who have since removed
     * their copy, because they still read it.
     */
    public function readCount(): int
    {
        return $this->receipts()->withTrashed()->whereNotNull('read_at')->count();
    }

    /**
     * The date shown in the list: when it went out, when it is due to, or when
     * the draft was written.
     */
    public function timelineDate(): CarbonInterface
    {
        return $this->sent_at ?? $this->scheduled_at ?? $this->created_at;
    }

    /**
     * Human summary of the channels used, e.g. "In-app, Email".
     */
    public function channelLabel(): string
    {
        return NotificationChannel::labelFor($this->channels);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * Restrict to announcements authored by one organization, or to the
     * platform's own when given NULL.
     *
     * @param  Builder<Notification>  $query
     */
    public function scopeComposedBy(Builder $query, ?int $schoolId): void
    {
        if ($schoolId === null) {
            $query->whereNull('notifications.school_id');

            return;
        }

        $query->where('notifications.school_id', $schoolId);
    }

    /**
     * Scheduled announcements whose time has come.
     *
     * @param  Builder<Notification>  $query
     */
    public function scopeDue(Builder $query): void
    {
        $query->where('status', NotificationStatus::Scheduled)
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now());
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => NotificationCategory::class,
            'priority' => NotificationPriority::class,
            'channels' => 'array',
            'audience_type' => NotificationAudience::class,
            'audience' => 'array',
            'status' => NotificationStatus::class,
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
            'recipients_count' => 'integer',
        ];
    }
}
