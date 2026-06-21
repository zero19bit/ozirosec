<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\WriteupTranslation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PublicWriteupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = $request->query('locale', 'en');
        /** @var WriteupTranslation|null $translation */
        $translation = $this->translations->firstWhere('locale', $locale) ?? $this->translations->first();

        return [
            'id' => $this->id,
            'title' => $translation?->title,
            'slug' => $translation?->slug,
            'locale' => $translation?->locale,
            'translation_fallback' => $translation !== null && $translation->locale !== $locale,
            'translations' => $translation === null ? [] : [$this->translation($translation)],
            'short_summary' => $translation?->short_summary,
            'key_findings' => $translation?->key_findings,
            'technical_overview' => $translation?->technical_overview,
            'attack_explanation' => $translation?->attack_explanation,
            'root_cause' => $translation?->root_cause,
            'impact' => $translation?->impact,
            'mitigation' => $translation?->mitigation,
            'developer_lessons' => $translation?->developer_lessons,
            'conclusion' => $translation?->conclusion,
            'original_title' => $this->original_title,
            'canonical_url' => $this->canonical_url,
            'original_author' => $this->original_author,
            'original_published_at' => $this->original_published_at,
            'difficulty' => $this->difficulty,
            'writeup_type' => $this->writeup_type,
            'reading_time_minutes' => $this->reading_time_minutes,
            'featured_image_url' => $this->featured_image_url,
            'published_at' => $this->published_at,
            'tags' => $this->tags->pluck('name')->values(),
            'vulnerabilities' => $this->vulnerabilityLinks->pluck('vulnerability_id')->values(),
            'labs' => $this->labLinks->pluck('lab_key')->values(),
            'source' => $this->source?->only(['name', 'slug', 'base_url']),
        ];
    }

    /** @return array<string, mixed> */
    private function translation(WriteupTranslation $translation): array
    {
        return [
            'locale' => $translation->locale,
            'title' => $translation->title,
            'slug' => $translation->slug,
            'short_summary' => $translation->short_summary,
            'key_findings' => $translation->key_findings,
            'technical_overview' => $translation->technical_overview,
            'attack_explanation' => $translation->attack_explanation,
            'root_cause' => $translation->root_cause,
            'impact' => $translation->impact,
            'mitigation' => $translation->mitigation,
            'developer_lessons' => $translation->developer_lessons,
            'conclusion' => $translation->conclusion,
        ];
    }
}
