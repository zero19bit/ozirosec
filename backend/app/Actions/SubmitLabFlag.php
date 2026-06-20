<?php

declare(strict_types=1);

namespace App\Actions;

use App\Services\VulnerabilityManager;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class SubmitLabFlag
{
    public function __construct(
        private readonly VulnerabilityManager $vulnerabilities,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(Request $request, int|string $userId, string $labKey, string $flag): array
    {
        $result = $this->vulnerabilities->verifyFlag(
            labKey: $labKey,
            candidateFlag: $flag,
        );

        $progress = DB::transaction(function () use ($request, $result, $userId, $labKey, $flag): ?array {
            $now = now();

            DB::table('submission_logs')->insert([
                'user_id' => $userId,
                'lab_key' => $labKey,
                'submitted_digest' => $this->submissionDigest($flag),
                'was_correct' => $result->isCorrect(),
                'ip_digest' => hash('sha256', (string) $request->ip()),
                'user_agent_digest' => hash('sha256', (string) $request->userAgent()),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            if ($result->status->value !== 'correct' && $result->status->value !== 'incorrect') {
                return null;
            }

            DB::table('user_progress')->insertOrIgnore([
                'user_id' => $userId,
                'lab_key' => $labKey,
                'status' => 'started',
                'attempt_count' => 0,
                'points_awarded' => 0,
                'started_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $current = DB::table('user_progress')
                ->where('user_id', $userId)
                ->where('lab_key', $labKey)
                ->lockForUpdate()
                ->first();

            abort_if($current === null, 409, 'Unable to record lab progress.');

            $wasCompleted = $current->status === 'completed';
            $pointsAwardedNow = $result->isCorrect() && ! $wasCompleted ? $result->pointsAwarded : 0;
            $attemptCount = ((int) $current->attempt_count) + 1;
            $completedAt = $current->completed_at;

            if ($result->isCorrect() && $completedAt === null) {
                $completedAt = $now;
            }

            DB::table('user_progress')
                ->where('id', $current->id)
                ->update([
                    'status' => $result->isCorrect() ? 'completed' : $current->status,
                    'attempt_count' => $attemptCount,
                    'points_awarded' => ((int) $current->points_awarded) + $pointsAwardedNow,
                    'first_attempted_at' => $current->first_attempted_at ?? $now,
                    'last_submitted_at' => $now,
                    'completed_at' => $completedAt,
                    'updated_at' => $now,
                ]);

            return [
                'lab_key' => $labKey,
                'status' => $result->isCorrect() ? 'completed' : $current->status,
                'attempt_count' => $attemptCount,
                'points_awarded_total' => ((int) $current->points_awarded) + $pointsAwardedNow,
                'points_awarded_now' => $pointsAwardedNow,
                'completed' => $result->isCorrect() || $wasCompleted,
                'first_attempted_at' => $this->timestampToIso($current->first_attempted_at) ?? $now->toISOString(),
                'last_submitted_at' => $now->toISOString(),
                'completed_at' => $this->timestampToIso($completedAt),
            ];
        }, 3);

        $data = $result->toResponse();

        if ($progress !== null) {
            $data['points_awarded'] = $progress['points_awarded_now'];
            $data['progress'] = $progress;
        }

        return $data;
    }

    private function submissionDigest(string $candidateFlag): string
    {
        $key = (string) Config::get('app.key', 'training-local-key');

        return hash_hmac('sha256', trim($candidateFlag), $key);
    }

    private function timestampToIso(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return $value instanceof Carbon
            ? $value->toISOString()
            : Carbon::parse((string) $value)->toISOString();
    }
}
