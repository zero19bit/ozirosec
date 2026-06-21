<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\WriteupTranslationStatus;
use App\Models\User;
use App\Models\Writeup;
use Illuminate\Support\Facades\DB;

final class ReviewWriteupTranslationsAction
{
    public function handle(Writeup $writeup, User $reviewer): Writeup
    {
        return DB::transaction(function () use ($writeup, $reviewer): Writeup {
            $locked = Writeup::query()->lockForUpdate()->findOrFail($writeup->id);
            $locked->translations()
                ->whereIn('locale', ['en', 'fa'])
                ->update([
                    'translation_status' => WriteupTranslationStatus::Reviewed->value,
                    'reviewed_by' => $reviewer->id,
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

            return $locked->load(['translations', 'tags', 'vulnerabilityLinks', 'labLinks', 'source']);
        });
    }
}
