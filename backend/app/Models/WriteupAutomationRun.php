<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\WriteupAutomationRunFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class WriteupAutomationRun extends Model
{
    /** @use HasFactory<WriteupAutomationRunFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(WriteupSource::class, 'source_id');
    }

    public function writeups(): HasMany
    {
        return $this->hasMany(Writeup::class, 'automation_run_id');
    }
}
