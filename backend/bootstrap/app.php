<?php

use App\Http\Middleware\EnsureEmailIsVerified;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsNotSuspended;
use App\Http\Middleware\VerifyWriteupIngestionSignature;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Routing\Exceptions\InvalidSignatureException;
use Illuminate\Session\TokenMismatchException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->throttleApi();
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'verified' => EnsureEmailIsVerified::class,
            'not.suspended' => EnsureUserIsNotSuspended::class,
            'writeup.ingestion' => VerifyWriteupIngestionSignature::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(static function (InvalidSignatureException $exception) {
            if (request()->route()?->getName() !== 'api.v1.verification.verify') {
                return null;
            }

            $expires = request()->query('expires');
            $reason = is_numeric($expires) && (int) $expires < now()->getTimestamp() ? 'expired' : 'invalid';
            $url = rtrim((string) config('hackpath.frontend_url'), '/').'/verify-email/error?reason='.$reason;

            return redirect()->away($url);
        });

        $exceptions->render(static function (AuthenticationException $exception) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        });

        $exceptions->render(static function (TokenMismatchException $exception) {
            return response()->json(['message' => 'CSRF token mismatch or session expired.'], 419);
        });

        $exceptions->render(static function (TooManyRequestsHttpException $exception) {
            $headers = $exception->getHeaders();
            $retryAfter = isset($headers['Retry-After']) ? (int) $headers['Retry-After'] : null;

            return response()->json([
                'message' => 'Too many requests.',
                'errors' => [
                    'rate_limit' => ['Too many requests. Please retry later.'],
                ],
                'retry_after' => $retryAfter,
            ], 429, $headers);
        });

        $exceptions->render(static function (HttpExceptionInterface $exception) {
            if (! request()->expectsJson()) {
                return null;
            }

            if ($exception->getStatusCode() === 419) {
                return response()->json(['message' => 'CSRF token mismatch or session expired.'], 419);
            }

            return response()->json([
                'message' => $exception->getMessage() !== '' ? $exception->getMessage() : 'Request failed.',
            ], $exception->getStatusCode());
        });
    })->create();
