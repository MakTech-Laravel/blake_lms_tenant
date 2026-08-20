<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * NotificationRecipient
 * ─────────────────────────────────────────────────────────────────────────────
 * One person's copy of one announcement, and everything that is true of it for
 * them alone: whether they have read it, when, whether they have archived it,
 * and whether the email went out.
 *
 * Soft deleted on purpose. A recipient removing a notification must hide it from
 * them and nobody else, so the delete lives here on the pivot rather than on the
 * Notification, which stays intact for every other recipient and for the
 * author's delivery report.
 *
 * @property int $id
 * @property int $notification_id
 * @property int $user_id
 * @property Carbon|null $read_at
 * @property Carbon|null $archived_at
 * @property Carbon|null $emailed_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class NotificationRecipient extends Pivot
{
    use SoftDeletes;

    protected $table = 'notification_user';

    public $incrementing = true;

    protected $fillable = [
        'notification_id',
        'user_id',
        'read_at',
        'archived_at',
        'emailed_at',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The announcement this copy belongs to.
     */
    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    /**
     * The person holding this copy.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Behaviour ─────────────────────────────────────────────────────────────

    /**
     * Whether the recipient has opened it.
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    /**
     * Mark as read, leaving an already-read timestamp alone so the first open is
     * the one recorded.
     */
    public function markRead(): void
    {
        if ($this->read_at !== null) {
            return;
        }

        $this->update(['read_at' => now()]);
    }

    /**
     * Return to the unread state.
     */
    public function markUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    /**
     * @param  Builder<NotificationRecipient>  $query
     */
    public function scopeUnread(Builder $query): void
    {
        $query->whereNull('read_at');
    }

    /**
     * @param  Builder<NotificationRecipient>  $query
     */
    public function scopeArchived(Builder $query): void
    {
        $query->whereNotNull('archived_at');
    }

    /**
     * Everything still in the recipient's main inbox: not archived by them.
     *
     * @param  Builder<NotificationRecipient>  $query
     */
    public function scopeInbox(Builder $query): void
    {
        $query->whereNull('archived_at');
    }

    // ── Casts ─────────────────────────────────────────────────────────────────

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'archived_at' => 'datetime',
            'emailed_at' => 'datetime',
        ];
    }
}
