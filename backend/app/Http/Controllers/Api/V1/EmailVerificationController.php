<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

final class EmailVerificationController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'verified' => $request->user()->hasVerifiedEmail(),
                'email_verified' => $request->user()->hasVerifiedEmail(),
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

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $exception) {
            Log::warning('Email verification notification could not be sent.', [
                'user_id' => $user->getKey(),
                'exception' => $exception::class,
            ]);

            return response()->json([
                'message' => 'Unable to send the verification email. Please try again later.',
            ], 503);
        }

        return response()->json([
            'message' => 'Verification link sent.',
            'data' => ['verified' => false],
        ]);
    }

    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::query()->find($id);

        if (! $user || ! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return $this->redirectToError('invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->redirectToSuccess('already-verified');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->redirectToSuccess();
    }

    private function redirectToSuccess(?string $status = null): RedirectResponse
    {
        $url = rtrim((string) config('hackpath.frontend_url'), '/').'/verify-email/success';

        if ($status !== null) {
            $url .= '?status='.rawurlencode($status);
        }

        return redirect()->away($url);
    }

    private function redirectToError(string $reason): RedirectResponse
    {
        return redirect()->away(rtrim((string) config('hackpath.frontend_url'), '/').'/verify-email/error?reason='.rawurlencode($reason));
    }
}
