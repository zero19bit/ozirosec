<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use App\Models\User;
use App\Models\Writeup;
use App\Models\WriteupTag;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CreateWriteupAction
{
    public function __construct(private readonly CheckWriteupDuplicateAction $duplicates) {}

    /** @param array<string, mixed> $data */
    public function handle(?User $actor, array $data, WriteupIngestionMethod $method = WriteupIngestionMethod::Manual, WriteupStatus $status = WriteupStatus::Draft): Writeup
    {
        $duplicate = $this->duplicates->handle($data['canonical_url'] ?? null, $data['source_id'] ?? null, $data['source_guid'] ?? null, $data['content_hash'] ?? null);
        if ($duplicate['is_duplicate']) {
            throw ValidationException::withMessages(['canonical_url' => ['A matching write-up already exists.']]);
        }

        return DB::transaction(function () use ($actor, $data, $method, $status): Writeup {
            $writeup = Writeup::query()->create([
                'source_id' => $data['source_id'] ?? null, 'ingestion_method' => $method,
                'original_title' => $data['original_title'], 'canonical_url' => $data['canonical_url'] ?? null,
                'source_guid' => $data['source_guid'] ?? null, 'original_author' => $data['original_author'] ?? null,
                'original_language' => $data['original_language'] ?? 'en', 'original_published_at' => $data['original_published_at'] ?? null,
                'difficulty' => $data['difficulty'] ?? null, 'writeup_type' => $data['writeup_type'] ?? null,
                'reading_time_minutes' => $data['reading_time_minutes'] ?? null, 'featured_image_url' => $data['featured_image_url'] ?? null,
                'content_hash' => $data['content_hash'] ?? null, 'is_featured' => $data['is_featured'] ?? false,
                'ai_generated' => $data['ai_generated'] ?? false, 'ai_provider' => $data['ai_provider'] ?? null,
                'ai_model' => $data['ai_model'] ?? null, 'ai_confidence' => $data['ai_confidence'] ?? null, 'created_by' => $actor?->id,
            ]);
            $writeup->status = $status;
            $writeup->save();
            $this->sync($writeup, $data);

            return $writeup->load(['translations', 'tags', 'vulnerabilityLinks', 'labLinks']);
        });
    }

    /** @param array<string, mixed> $data */
    public function sync(Writeup $writeup, array $data): void
    {
        foreach ($data['translations'] ?? [] as $translation) {
            $writeup->translations()->create($translation);
        }
        foreach ($data['vulnerability_ids'] ?? [] as $id) {
            $writeup->vulnerabilityLinks()->create(['vulnerability_id' => $id]);
        }
        foreach ($data['lab_keys'] ?? [] as $key) {
            $writeup->labLinks()->create(['lab_key' => $key]);
        }
        $tagIds = collect($data['tags'] ?? [])->map(fn (string $tag): int => WriteupTag::query()->firstOrCreate(['slug' => str($tag)->slug()], ['name' => $tag])->id);
        $writeup->tags()->sync($tagIds);
    }
}
