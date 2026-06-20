<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class ProgressController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $userId = $request->user()->getAuthIdentifier();

        $rows = DB::table('user_progress')
            ->where('user_id', $userId)
            ->orderBy('lab_key')
            ->get([
                'lab_key',
                'status',
                'attempt_count',
                'points_awarded',
                'first_attempted_at',
                'last_submitted_at',
                'completed_at',
            ]);

        $completedLabs = $rows
            ->where('status', 'completed')
            ->pluck('lab_key')
            ->values()
            ->all();

        return response()->json([
            'data' => [
                'completed_labs' => $completedLabs,
                'total_xp' => (int) $rows->sum('points_awarded'),
                'progress' => $rows->map(fn (object $row): array => [
                    'lab_key' => $row->lab_key,
                    'status' => $row->status,
                    'completed' => $row->status === 'completed',
                    'attempt_count' => (int) $row->attempt_count,
                    'points_awarded' => (int) $row->points_awarded,
                    'first_attempted_at' => $this->timestampToIso($row->first_attempted_at),
                    'last_submitted_at' => $this->timestampToIso($row->last_submitted_at),
                    'completed_at' => $this->timestampToIso($row->completed_at),
                ])->values()->all(),
            ],
        ]);
    }

    private function timestampToIso(mixed $value): ?string
    {
        return $value === null ? null : Carbon::parse((string) $value)->toISOString();
    }
}
