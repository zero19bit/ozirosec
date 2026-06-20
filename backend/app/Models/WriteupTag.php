<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class WriteupTag extends Model
{
    protected $guarded = ['id'];

    public function writeups(): BelongsToMany
    {
        return $this->belongsToMany(Writeup::class, 'writeup_tag')->withTimestamps();
    }
}
