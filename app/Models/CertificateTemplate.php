<?php

namespace App\Models;

use Database\Factories\CertificateTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * CertificateTemplate
 * ─────────────────────────────────────────────────────────────────────────────
 * Blade-backed layout used when generating PDF/PNG certificates.
 *
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $blade_view
 * @property bool $is_default
 * @property bool $is_active
 */
class CertificateTemplate extends Model
{
    /** @use HasFactory<CertificateTemplateFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'blade_view',
        'is_default',
        'is_active',
    ];

    /**
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
