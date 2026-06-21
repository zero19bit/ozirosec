<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\ApproveWriteupAction;
use App\Actions\ArchiveWriteupAction;
use App\Actions\CreateWriteupAction;
use App\Actions\DeleteWriteupAction;
use App\Actions\PublishWriteupAction;
use App\Actions\RejectWriteupAction;
use App\Actions\RequestWriteupRevisionAction;
use App\Actions\ReviewWriteupTranslationsAction;
use App\Actions\ScheduleWriteupAction;
use App\Actions\SubmitWriteupForReviewAction;
use App\Actions\TransitionWriteupAction;
use App\Actions\UpdateWriteupAction;
use App\Enums\WriteupStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Writeups\CreateWriteupRequest;
use App\Http\Requests\Api\V1\Writeups\UpdateWriteupRequest;
use App\Http\Resources\Api\V1\AdminWriteupResource;
use App\Http\Resources\Api\V1\PublicWriteupResource;
use App\Models\Writeup;
use App\Models\WriteupAutomationRun;
use App\Models\WriteupSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

final class WriteupController extends Controller
{
    private function relations($query)
    {
        return $query->with(['translations', 'tags', 'vulnerabilityLinks', 'labLinks', 'source']);
    }

    public function index(Request $request): mixed
    {
        $q = $this->relations(Writeup::query()->published());
        $this->publicFilters($q, $request);

        return PublicWriteupResource::collection($q->paginate(min(max((int) $request->query('per_page', 20), 1), 50)));
    }

    public function show(Request $request, string $slug): PublicWriteupResource
    {
        $locale = $request->query('locale', 'en');
        $item = $this->relations(Writeup::query()->published())->whereHas('translations', fn ($q) => $q->where('locale', $locale)->where('slug', $slug))->firstOr(fn () => $this->relations(Writeup::query()->published())->whereHas('translations', fn ($q) => $q->where('slug', $slug))->firstOrFail());

        return new PublicWriteupResource($item);
    }

    public function vulnerability(Request $request, string $vulnerability): mixed
    {
        abort_unless(in_array($vulnerability, config('writeups.vulnerability_ids'), true), 404);

        return PublicWriteupResource::collection($this->relations(Writeup::query()->published())->whereHas('vulnerabilityLinks', fn ($q) => $q->where('vulnerability_id', $vulnerability))->paginate(20));
    }

    public function lab(Request $request, string $lab): mixed
    {
        abort_unless(array_key_exists($lab, config('vulnerabilities.labs', [])), 404);

        return PublicWriteupResource::collection($this->relations(Writeup::query()->published())->whereHas('labLinks', fn ($q) => $q->where('lab_key', $lab))->paginate(20));
    }

    public function adminIndex(Request $request): mixed
    {
        Gate::authorize('viewAny', Writeup::class);
        $q = $this->relations(Writeup::query());
        foreach (['status', 'source_id', 'created_by', 'reviewed_by', 'ingestion_method'] as $field) {
            if ($request->filled($field)) {
                $q->where($field, $request->query($field));
            }
        } if ($request->boolean('ai_generated')) {
            $q->where('ai_generated', true);
        }

        return AdminWriteupResource::collection($q->latest()->paginate(min(max((int) $request->query('per_page', 20), 1), 100)));
    }

    public function store(CreateWriteupRequest $request, CreateWriteupAction $action): AdminWriteupResource
    {
        Gate::authorize('create', Writeup::class);

        return new AdminWriteupResource($action->handle($request->user(), $request->validated()));
    }

    public function adminShow(Writeup $writeup): AdminWriteupResource
    {
        Gate::authorize('view', $writeup);

        return new AdminWriteupResource($this->relations($writeup->newQuery())->findOrFail($writeup->id));
    }

    public function update(UpdateWriteupRequest $request, Writeup $writeup, UpdateWriteupAction $action): AdminWriteupResource
    {
        Gate::authorize('update', $writeup);

        return new AdminWriteupResource($action->handle($writeup, $request->validated()));
    }

    public function transition(Request $request, Writeup $writeup, string $operation, SubmitWriteupForReviewAction $submit, ApproveWriteupAction $approve, RequestWriteupRevisionAction $revision, RejectWriteupAction $reject, ArchiveWriteupAction $archive, PublishWriteupAction $publish, ScheduleWriteupAction $schedule, ReviewWriteupTranslationsAction $reviewTranslations): AdminWriteupResource
    {
        Gate::authorize(in_array($operation, ['submit', 'revision']) ? 'update' : 'review', $writeup);
        $actor = $request->user();
        $result = match ($operation) {
            'submit' => $submit->handle($writeup, $actor),'approve' => $approve->handle($writeup, $actor),'revision' => $revision->handle($writeup, $actor),'reject' => $reject->handle($writeup, $actor),'archive' => $archive->handle($writeup, $actor),'publish' => $publish->handle($writeup, $actor),'schedule' => $schedule->handle($writeup, $actor, now()->parse($request->validate(['scheduled_for' => ['required', 'date', 'after:now']])['scheduled_for'])),'restore' => app(TransitionWriteupAction::class)->handle($writeup, $actor, WriteupStatus::Draft),'review-translations' => $reviewTranslations->handle($writeup, $actor),default => abort(404)
        };

        return new AdminWriteupResource($result);
    }

    public function destroy(Writeup $writeup, DeleteWriteupAction $action): JsonResponse
    {
        Gate::authorize('delete', $writeup);
        $action->handle($writeup);

        return response()->json(['data' => null]);
    }

    public function sources(Request $request): JsonResponse
    {
        Gate::authorize('manageSources', Writeup::class);
        if ($request->isMethod('get')) {
            return response()->json(['data' => WriteupSource::query()->paginate(50)]);
        } $data = $request->validate(['name' => ['required', 'string', 'max:160'], 'slug' => ['required', 'alpha_dash', 'max:160', 'unique:writeup_sources,slug'], 'base_url' => ['required', 'url'], 'source_type' => ['required', 'in:rss,api,html,manual']]);

        return response()->json(['data' => WriteupSource::query()->create($data)], 201);
    }

    public function automation(Request $request): JsonResponse
    {
        Gate::authorize('viewAutomation', Writeup::class);

        return response()->json(['data' => WriteupAutomationRun::query()->latest('started_at')->paginate(50)]);
    }

    private function publicFilters($q, Request $r): void
    {
        if ($r->filled('search')) {
            $q->whereHas('translations', fn ($x) => $x->where('title', 'like', '%'.str($r->query('search'))->limit(100).'%'));
        } if ($r->filled('difficulty')) {
            $q->where('difficulty', $r->query('difficulty'));
        } if ($r->filled('source')) {
            $q->where('source_id', $r->query('source'));
        } if ($r->boolean('featured')) {
            $q->featured();
        } if ($r->filled('tag')) {
            $q->whereHas('tags', fn ($x) => $x->where('slug', $r->query('tag')));
        } $q->orderByDesc('published_at');
    }
}
