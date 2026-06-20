<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WriteupSourceType;
use App\Support\WriteupUrlNormalizer;
use Database\Factories\WriteupSourceFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class WriteupSource extends Model
{
    /** @use HasFactory<WriteupSourceFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = ['id', 'deleted_at'];

    protected function casts(): array
    {
        return [
            'source_type' => WriteupSourceType::class,
            'is_enabled' => 'boolean',
            'auto_publish' => 'boolean',
            'requires_review' => 'boolean',
            'metadata' => 'array',
            'last_checked_at' => 'datetime',
            'last_success_at' => 'datetime',
            'last_error_at' => 'datetime',
        ];
    }

    public function writeups(): HasMany
    {
        return $this->hasMany(Writeup::class, 'source_id');
    }

    public function automationRuns(): HasMany
    {
        return $this->hasMany(WriteupAutomationRun::class, 'source_id');
    }

    public function scopeEnabled(Builder $query): void
    {
        $query->where('is_enabled', true);
    }

    public function setBaseUrlAttribute(?string $value): void
    {
        $this->attributes['base_url'] = WriteupUrlNormalizer::normalize($value);
    }

    public function setFeedUrlAttribute(?string $value): void
    {
        $this->attributes['feed_url'] = WriteupUrlNormalizer::normalize($value);
    }

    public function setApiUrlAttribute(?string $value): void
    {
        $this->attributes['api_url'] = WriteupUrlNormalizer::normalize($value);
    }
}
