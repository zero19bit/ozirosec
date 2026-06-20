<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use App\Support\WriteupUrlNormalizer;
use Database\Factories\WriteupFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Writeup extends Model
{
    /** @use HasFactory<WriteupFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [
        'id',
        'status',
        'reviewed_by',
        'reviewed_at',
        'approved_by',
        'approved_at',
        'published_at',
        'automation_run_id',
        'internal_notes',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'ingestion_method' => WriteupIngestionMethod::class,
            'status' => WriteupStatus::class,
            'is_featured' => 'boolean',
            'ai_generated' => 'boolean',
            'ai_confidence' => 'decimal:4',
            'original_published_at' => 'datetime',
            'scheduled_for' => 'datetime',
            'published_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(WriteupSource::class, 'source_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function automationRun(): BelongsTo
    {
        return $this->belongsTo(WriteupAutomationRun::class, 'automation_run_id');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(WriteupTranslation::class);
    }

    public function vulnerabilityLinks(): HasMany
    {
        return $this->hasMany(WriteupVulnerability::class);
    }

    public function labLinks(): HasMany
    {
        return $this->hasMany(LabWriteup::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(WriteupTag::class, 'writeup_tag')->withTimestamps();
    }

    public function ingestionAttempts(): HasMany
    {
        return $this->hasMany(WriteupIngestionAttempt::class);
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', WriteupStatus::Published)->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeScheduled(Builder $query): void
    {
        $query->where('status', WriteupStatus::Scheduled)->whereNotNull('scheduled_for');
    }

    public function scopePendingReview(Builder $query): void
    {
        $query->where('status', WriteupStatus::PendingReview);
    }

    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    public function scopeWithLocale(Builder $query, string $locale): void
    {
        $query->whereHas('translations', static fn (Builder $translations): Builder => $translations->where('locale', $locale));
    }

    public function scopeFromSource(Builder $query, int $sourceId): void
    {
        $query->where('source_id', $sourceId);
    }

    public function isPublished(): bool
    {
        return $this->status === WriteupStatus::Published && $this->published_at !== null && $this->published_at->isPast();
    }

    public function isScheduled(): bool
    {
        return $this->status === WriteupStatus::Scheduled;
    }

    public function isPendingReview(): bool
    {
        return $this->status === WriteupStatus::PendingReview;
    }

    public function isArchived(): bool
    {
        return $this->status === WriteupStatus::Archived;
    }

    public function setCanonicalUrlAttribute(?string $value): void
    {
        $normalized = WriteupUrlNormalizer::normalize($value);
        $this->attributes['canonical_url'] = $normalized;
        $this->attributes['canonical_url_hash'] = $normalized === null ? null : hash('sha256', $normalized);
    }

    public function setSourceGuidAttribute(?string $value): void
    {
        $normalized = $value === null ? null : trim($value);
        $this->attributes['source_guid'] = $normalized === '' ? null : $normalized;
        $this->attributes['source_guid_hash'] = $normalized === null || $normalized === '' ? null : hash('sha256', $normalized);
    }
}
