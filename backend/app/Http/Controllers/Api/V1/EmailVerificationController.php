<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EmailVerificationController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'verified' => $request->user()->hasVerifiedEmail(),
                'email' => $request->user()->email,
                'email_verified_at' => $request->user()->email_verified_at?->toAtomString(),
            ],
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email address is already verified.',
                'data' => ['verified' => true],
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Verification link sent.',
            'data' => ['verified' => false],
        ]);
    }

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = $request->user();

        abort_if((int) $user->getAuthIdentifier() !== $id, 403, 'Verification link does not belong to the authenticated user.');
        abort_if(! hash_equals(sha1($user->getEmailForVerification()), $hash), 403, 'Invalid verification link.');

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email address is already verified.',
                'data' => [
                    'verified' => true,
                    'user' => UserResource::make($user),
                ],
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json([
            'message' => 'Email address verified.',
            'data' => [
                'verified' => true,
                'user' => UserResource::make($user->fresh() ?? $user),
            ],
        ]);
    }
}
