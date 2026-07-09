<?php

namespace App\Models;

use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Post
 * ─────────────────────────────────────────────────────────────────────────────
 * A minimal post model used by the FileUpload edit-mode demo.
 * Extend with your own fields (body, user_id, published_at, etc.) as needed.
 *
 * @property int $id
 * @property string $title
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;

    protected $fillable = ['title'];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    /**
     * Delete all physical files + attachment records when a post is deleted.
     * Uses the Attachment::deleted observer so Storage::delete() is always called.
     */
    protected static function booted(): void
    {
        static::deleting(function (Post $post) {
            // each() triggers the Attachment model observer → deletes the file
            $post->attachments->each->delete();
        });
    }
}
