<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AdminWriteupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return array_merge((new PublicWriteupResource($this))->toArray($request), [
            'status' => $this->status,
            'ingestion_method' => $this->ingestion_method,
            'source_id' => $this->source_id,
            'created_by' => $this->created_by,
            'reviewed_by' => $this->reviewed_by,
            'approved_by' => $this->approved_by,
            'scheduled_for' => $this->scheduled_for,
            'ai_generated' => $this->ai_generated,
            'ai_provider' => $this->ai_provider,
            'ai_model' => $this->ai_model,
            'ai_confidence' => $this->ai_confidence,
            'internal_notes' => $this->internal_notes,
            'translations' => $this->translations->map(static fn ($translation): array => [
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
                'translation_status' => $translation->translation_status,
            ])->values(),
        ]);
    }
}
