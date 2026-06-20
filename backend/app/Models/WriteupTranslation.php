<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WriteupTranslationStatus;
use Database\Factories\WriteupTranslationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WriteupTranslation extends Model
{
    /** @use HasFactory<WriteupTranslationFactory> */
    use HasFactory;

    protected $guarded = ['id', 'reviewed_by', 'reviewed_at'];

    protected function casts(): array
    {
        return [
            'key_findings' => 'array',
            'translation_status' => WriteupTranslationStatus::class,
            'is_ai_generated' => 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    public function writeup(): BelongsTo
    {
        return $this->belongsTo(Writeup::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPublicationReady(): bool
    {
        return $this->translation_status->isPublicationReady();
    }
}
