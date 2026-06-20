<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Internal;

use App\Actions\CheckWriteupDuplicateAction;
use App\Actions\CreateWriteupAction;
use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use App\Enums\WriteupTranslationStatus;
use App\Http\Controllers\Controller;
use App\Models\WriteupAutomationRun;
use App\Models\WriteupIngestionAttempt;
use App\Models\WriteupSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class WriteupIngestionController extends Controller
{
    public function sources(): JsonResponse
    {
        return response()->json(['data' => WriteupSource::query()->enabled()->whereIn('source_type', config('writeup_ingestion.allowed_source_types'))->get(['id', 'name', 'slug', 'base_url', 'feed_url', 'api_url', 'source_type', 'original_language', 'fetch_interval_minutes'])]);
    }

    public function duplicate(Request $request, CheckWriteupDuplicateAction $action): JsonResponse
    {
        $data = $request->validate(['source_id' => ['nullable', 'integer', 'exists:writeup_sources,id'], 'canonical_url' => ['nullable', 'url', 'max:2048'], 'source_guid' => ['nullable', 'string', 'max:500'], 'content_hash' => ['nullable', 'string', 'size:64'], 'title' => ['nullable', 'string', 'max:500']]);
        $result = $action->handle($data['canonical_url'] ?? null, $data['source_id'] ?? null, $data['source_guid'] ?? null, $data['content_hash'] ?? null);

        return response()->json(['data' => $result + ['probable_duplicate' => false]]);
    }

    public function ingest(Request $request, CreateWriteupAction $action): JsonResponse
    {
        $data = $request->validate(['request_id' => ['required', 'uuid'], 'source_id' => ['required', 'integer', 'exists:writeup_sources,id'], 'original_title' => ['required', 'string', 'max:500'], 'canonical_url' => ['nullable', 'url', 'max:2048'], 'source_guid' => ['nullable', 'string', 'max:500'], 'content_hash' => ['nullable', 'string', 'size:64'], 'original_author' => ['nullable', 'string', 'max:255'], 'original_language' => ['required', 'in:en,fa'], 'tags' => ['array', 'max:15'], 'tags.*' => ['string', 'max:120'], 'vulnerability_ids' => ['array', 'max:10'], 'vulnerability_ids.*' => ['in:'.implode(',', config('writeups.vulnerability_ids'))], 'lab_keys' => ['array', 'max:10'], 'lab_keys.*' => ['in:'.implode(',', array_keys(config('vulnerabilities.labs', [])))], 'translations' => ['required', 'array', 'size:2'], 'translations.*.locale' => ['required', 'in:en,fa'], 'translations.*.title' => ['required', 'string', 'max:500'], 'translations.*.slug' => ['required', 'regex:/^[a-z0-9\-]+$/', 'max:200'], 'translations.*.short_summary' => ['required', 'string', 'max:5000', 'not_regex:/<\/?[a-z][^>]*>/i'], 'translations.*.key_findings' => ['nullable', 'array', 'max:20'], 'translations.*.technical_overview' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.attack_explanation' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.root_cause' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.impact' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.mitigation' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.developer_lessons' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'translations.*.conclusion' => ['nullable', 'string', 'max:50000', 'not_regex:/<script\b/i'], 'automation_run_id' => ['nullable', 'integer', 'exists:writeup_automation_runs,id'], 'ai_generated' => ['sometimes', 'boolean'], 'ai_provider' => ['nullable', 'string', 'max:100'], 'ai_model' => ['nullable', 'string', 'max:160'], 'ai_confidence' => ['nullable', 'numeric', 'between:0,1']]);
        foreach ($data['translations'] as &$translation) {
            $translation['translation_status'] = WriteupTranslationStatus::MachineGenerated;
            $translation['is_ai_generated'] = true;
        } unset($translation);
        $source = WriteupSource::query()->enabled()->findOrFail($data['source_id']);
        $writeup = $action->handle(null, $data, WriteupIngestionMethod::N8n, WriteupStatus::PendingReview);
        $writeup->automation_run_id = $data['automation_run_id'] ?? null;
        $writeup->save();
        WriteupIngestionAttempt::query()->create(['request_id' => $data['request_id'], 'source_id' => $source->id, 'writeup_id' => $writeup->id, 'canonical_url' => $data['canonical_url'] ?? null, 'outcome' => 'ingested']);
        Log::info('Write-up ingested.', ['request_id' => $data['request_id'], 'source_id' => $source->id, 'writeup_id' => $writeup->id, 'canonical_url_hash' => $writeup->canonical_url_hash]);

        return response()->json(['data' => ['id' => $writeup->id, 'status' => $writeup->status]], 201);
    }

    public function createRun(Request $request): JsonResponse
    {
        $data = $request->validate(['source_id' => ['nullable', 'integer', 'exists:writeup_sources,id'], 'run_uuid' => ['required', 'uuid'], 'provider' => ['required', 'string', 'max:80'], 'external_run_id' => ['nullable', 'string', 'max:191']]);
        $run = WriteupAutomationRun::query()->create($data + ['status' => 'running', 'started_at' => now()]);

        return response()->json(['data' => ['id' => $run->id, 'run_uuid' => $run->run_uuid]], 201);
    }

    public function updateRun(Request $request, WriteupAutomationRun $run): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:running,completed,failed'], 'sources_checked' => ['integer', 'min:0'], 'items_discovered' => ['integer', 'min:0'], 'items_imported' => ['integer', 'min:0'], 'duplicates_skipped' => ['integer', 'min:0'], 'items_rejected' => ['integer', 'min:0'], 'translation_failures' => ['integer', 'min:0'], 'error_summary' => ['nullable', 'string', 'max:1000', 'not_regex:/(api[_ -]?key|secret|password|stack trace)/i']]);
        $run->fill($data);
        if (in_array($data['status'], ['completed', 'failed'], true)) {
            $run->completed_at = now();
        } $run->save();

        return response()->json(['data' => ['id' => $run->id, 'status' => $run->status]]);
    }
}
