<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\AdminUpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

final class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $perPage = min(max((int) $request->query('per_page', 20), 5), 100);

        $users = DB::table('users')
            ->select([
                'users.id',
                'users.username',
                'users.name',
                'users.email',
                'users.role',
                'users.suspended_at',
                'users.created_at',
                DB::raw('COUNT(DISTINCT user_progress.lab_key) as completed_labs'),
            ])
            ->leftJoin('user_progress', static function ($join): void {
                $join->on('users.id', '=', 'user_progress.user_id')
                    ->where('user_progress.status', '=', 'completed');
            })
            ->groupBy('users.id', 'users.username', 'users.name', 'users.email', 'users.role', 'users.suspended_at', 'users.created_at')
            ->orderByDesc('users.created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $users,
        ]);
    }

    public function metrics(): JsonResponse
    {
        Gate::authorize('viewMetrics', User::class);

        $totalRegistered = DB::table('users')->count();
        $adminUsers = DB::table('users')->where('role', UserRole::Admin->value)->count();
        $suspendedUsers = DB::table('users')->whereNotNull('suspended_at')->count();
        $resolvedFlags = DB::table('user_progress')->where('status', 'completed')->count();
        $correctSubmissions = DB::table('submission_logs')->where('was_correct', true)->count();
        $failedSubmissions = DB::table('submission_logs')->where('was_correct', false)->count();

        return response()->json([
            'data' => [
                'total_registered' => $totalRegistered,
                'admin_users' => $adminUsers,
                'suspended_users' => $suspendedUsers,
                'resolved_flags' => $resolvedFlags,
                'correct_submissions' => $correctSubmissions,
                'failed_submissions' => $failedSubmissions,
            ],
        ]);
    }

    public function logs(Request $request): JsonResponse
    {
        Gate::authorize('viewLogs', User::class);

        $limit = min(max((int) $request->query('limit', 50), 10), 200);

        $logs = DB::table('submission_logs')
            ->leftJoin('users', 'submission_logs.user_id', '=', 'users.id')
            ->select([
                'submission_logs.id',
                'submission_logs.lab_key',
                'submission_logs.was_correct',
                'submission_logs.ip_digest',
                'submission_logs.user_agent_digest',
                'submission_logs.created_at',
                'users.id as user_id',
                'users.username',
                'users.name',
                'users.email',
            ])
            ->orderByDesc('submission_logs.created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $logs,
        ]);
    }

    public function updateUser(AdminUpdateUserRequest $request, int $userId): JsonResponse
    {
        /** @var User $target */
        $target = User::query()->findOrFail($userId);

        Gate::authorize('update', $target);

        DB::transaction(function () use ($request, $target): void {
            $lockedTarget = User::query()->lockForUpdate()->findOrFail($target->getKey());
            Gate::authorize('update', $lockedTarget);

            $nextRole = $request->hasRoleChange() ? $request->role() : $lockedTarget->role;
            $nextSuspended = $request->hasSuspensionChange() ? $request->suspended() : $lockedTarget->suspended_at !== null;
            $wouldRemoveActiveAdmin = $lockedTarget->isActiveAdmin()
                && ($nextRole !== UserRole::Admin || $nextSuspended === true);

            if ($wouldRemoveActiveAdmin) {
                $activeAdminCount = User::query()
                    ->where('role', UserRole::Admin->value)
                    ->whereNull('suspended_at')
                    ->lockForUpdate()
                    ->count();

                abort_if($activeAdminCount <= 1, 422, 'At least one active administrator must remain.');
            }

            if ($request->hasRoleChange()) {
                $lockedTarget->role = $nextRole;
            }

            if ($request->hasSuspensionChange()) {
                $lockedTarget->suspended_at = $nextSuspended ? now() : null;
            }

            $lockedTarget->save();
        });

        $user = DB::table('users')
            ->select([
                'users.id',
                'users.username',
                'users.name',
                'users.email',
                'users.role',
                'users.suspended_at',
                'users.created_at',
                DB::raw('COUNT(DISTINCT user_progress.lab_key) as completed_labs'),
            ])
            ->leftJoin('user_progress', static function ($join): void {
                $join->on('users.id', '=', 'user_progress.user_id')
                    ->where('user_progress.status', '=', 'completed');
            })
            ->where('users.id', $userId)
            ->groupBy('users.id', 'users.username', 'users.name', 'users.email', 'users.role', 'users.suspended_at', 'users.created_at')
            ->first();

        abort_if($user === null, 404);

        return response()->json([
            'data' => [
                'user' => $user,
            ],
        ]);
    }
}
