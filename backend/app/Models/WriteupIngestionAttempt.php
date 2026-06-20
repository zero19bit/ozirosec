<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\WriteupUrlNormalizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WriteupIngestionAttempt extends Model
{
    protected $guarded = ['id'];

    public function source(): BelongsTo
    {
        return $this->belongsTo(WriteupSource::class, 'source_id');
    }

    public function writeup(): BelongsTo
    {
        return $this->belongsTo(Writeup::class);
    }

    public function setCanonicalUrlAttribute(?string $value): void
    {
        $normalized = WriteupUrlNormalizer::normalize($value);
        $this->attributes['canonical_url'] = $normalized;
        $this->attributes['canonical_url_hash'] = WriteupUrlNormalizer::sha256($normalized);
    }
}
