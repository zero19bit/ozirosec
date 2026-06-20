<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class LabWriteup extends Model
{
    protected $table = 'lab_writeup';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    public function writeup(): BelongsTo
    {
        return $this->belongsTo(Writeup::class);
    }
}
