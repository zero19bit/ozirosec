<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Writeup;
use Illuminate\Support\Facades\DB;

final class UpdateWriteupAction
{
    public function __construct(private readonly CreateWriteupAction $creator) {}

    /** @param array<string,mixed> $data */
    public function handle(Writeup $writeup, array $data): Writeup
    {
        return DB::transaction(function () use ($writeup, $data): Writeup {
            $writeup->fill(collect($data)->only(['source_id', 'original_title', 'canonical_url', 'source_guid', 'original_author', 'original_language', 'original_published_at', 'difficulty', 'writeup_type', 'reading_time_minutes', 'featured_image_url', 'content_hash', 'is_featured', 'ai_generated', 'ai_provider', 'ai_model', 'ai_confidence'])->all())->save();
            if (array_key_exists('translations', $data)) {
                $writeup->translations()->delete();
                $writeup->tags()->detach();
                $writeup->vulnerabilityLinks()->delete();
                $writeup->labLinks()->delete();
                $this->creator->sync($writeup, $data);
            }

            return $writeup->fresh(['translations', 'tags', 'vulnerabilityLinks', 'labLinks']);
        });
    }
}
