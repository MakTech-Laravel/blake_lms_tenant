<?php

namespace App\Models;

use Database\Factories\AttachmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * Attachment
 * ─────────────────────────────────────────────────────────────────────────────
 * Represents a single uploaded file linked to a Post.
 *
 * @property int $id
 * @property int $post_id
 * @property string $path Storage-relative path  e.g. posts/1/attachments/abc.jpg
 * @property string $original_name Client filename        e.g. my-photo.jpg
 * @property string $mime_type e.g. image/jpeg
 * @property int $size Bytes
 * @property string|null $label Optional human label
 * @property string $url (accessor) Full public URL
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Attachment extends Model
{
    /** @use HasFactory<AttachmentFactory> */
    use HasFactory;

    protected $fillable = [
        'post_id',
        'path',
        'original_name',
        'mime_type',
        'size',
        'label',
    ];

    protected $appends = ['url'];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Full public URL, ready to pass to the React <FileUpload> component as
     * `ExistingFile.url`.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    /**
     * Automatically delete the physical file when the record is deleted.
     * Triggered by both $attachment->delete() and cascaded deletes.
     */
    protected static function booted(): void
    {
        static::deleted(function (Attachment $attachment) {
            Storage::disk('public')->delete($attachment->path);
        });
    }
}
