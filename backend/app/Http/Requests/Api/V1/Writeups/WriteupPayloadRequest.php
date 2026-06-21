<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Writeups;

use App\Enums\WriteupTranslationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WriteupPayloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isActiveAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'source_id' => ['nullable', 'integer', 'exists:writeup_sources,id'], 'original_title' => ['required', 'string', 'max:500', 'not_regex:/<\/?[a-z][^>]*>/i'],
            'canonical_url' => ['nullable', 'url', 'max:2048'], 'source_guid' => ['nullable', 'string', 'max:500'], 'original_author' => ['nullable', 'string', 'max:255'], 'original_language' => ['nullable', 'string', 'max:12'], 'original_published_at' => ['nullable', 'date'],
            'difficulty' => ['nullable', Rule::in(['beginner', 'intermediate', 'advanced', 'expert'])], 'writeup_type' => ['nullable', 'string', 'max:80'], 'reading_time_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'], 'featured_image_url' => ['nullable', 'url', 'max:2048'], 'content_hash' => ['nullable', 'string', 'size:64'], 'is_featured' => ['sometimes', 'boolean'],
            'ai_generated' => ['sometimes', 'boolean'], 'ai_provider' => ['nullable', 'string', 'max:100'], 'ai_model' => ['nullable', 'string', 'max:160'], 'ai_confidence' => ['nullable', 'numeric', 'between:0,1'],
            'translations' => ['sometimes', 'array', 'max:2'], 'translations.*.locale' => ['required', 'in:en,fa'], 'translations.*.title' => ['required', 'string', 'max:500', 'not_regex:/<\/?[a-z][^>]*>/i'], 'translations.*.slug' => ['required', 'string', 'max:200', 'regex:/^[a-z0-9\-]+$/'], 'translations.*.short_summary' => ['required', 'string', 'max:5000', 'not_regex:/<\/?[a-z][^>]*>/i'], 'translations.*.key_findings' => ['nullable', 'array', 'max:20'], 'translations.*.key_findings.*' => ['string', 'max:500'],
            'translations.*.technical_overview' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.attack_explanation' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.root_cause' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.impact' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.mitigation' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.developer_lessons' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.conclusion' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.translation_status' => ['sometimes', Rule::enum(WriteupTranslationStatus::class)], 'translations.*.is_ai_generated' => ['sometimes', 'boolean'], 'translations.*.ai_model' => ['nullable', 'string', 'max:160'],
            'vulnerability_ids' => ['sometimes', 'array', 'max:10'], 'vulnerability_ids.*' => ['string', Rule::in(config('writeups.vulnerability_ids'))], 'lab_keys' => ['sometimes', 'array', 'max:10'], 'lab_keys.*' => ['string', Rule::in(array_keys(config('vulnerabilities.labs', [])))], 'tags' => ['sometimes', 'array', 'max:15'], 'tags.*' => ['string', 'max:120', 'regex:/^[\pL\pN][\pL\pN\s\-]{0,118}[\pL\pN]$/u'],
        ];
    }
}
