<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\WriteupIngestionNonce;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

final class VerifyWriteupIngestionSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('writeup_ingestion.hmac_secret');
        $timestamp = $request->header('X-HackPath-Timestamp');
        $nonce = $request->header('X-HackPath-Nonce');
        $digest = $request->header('X-HackPath-Content-SHA256');
        $signature = $request->header('X-HackPath-Signature');
        $body = $request->getContent();
        $max = (int) config('writeup_ingestion.max_payload_bytes');
        $invalid = $secret === '' || ! is_string($timestamp) || ! ctype_digit($timestamp) || ! is_string($nonce) || ! preg_match('/^[A-Za-z0-9_-]{22,128}$/', $nonce) || ! is_string($digest) || ! preg_match('/^[a-f0-9]{64}$/i', $digest) || ! is_string($signature) || ! preg_match('/^[a-f0-9]{64}$/i', $signature) || strlen($body) > $max || ($request->isMethod('GET') ? false : ! $request->isJson());
        $skew = (int) config('writeup_ingestion.allowed_clock_skew');
        $time = (int) $timestamp;
        $expectedDigest = hash('sha256', $body);
        $canonical = $request->method()."\n/".ltrim($request->path(), '/')."\n{$timestamp}\n{$nonce}\n{$expectedDigest}";
        $expected = hash_hmac('sha256', $canonical, $secret);
        if ($invalid || abs(now()->getTimestamp() - $time) > $skew || ! hash_equals(strtolower($digest), $expectedDigest) || ! hash_equals($expected, strtolower($signature))) {
            return $this->reject($request, 'authentication_failed');
        }
        try {
            WriteupIngestionNonce::query()->create(['nonce_hash' => hash('sha256', $nonce), 'expires_at' => now()->addSeconds((int) config('writeup_ingestion.nonce_retention_seconds'))]);
        } catch (QueryException) {
            return $this->reject($request, 'replay_rejected');
        }

        return $next($request);
    }

    private function reject(Request $request, string $outcome): Response
    {
        Log::warning('Write-up ingestion request rejected.', ['endpoint' => $request->path(), 'outcome' => $outcome, 'request_id' => $request->header('X-Request-Id')]);

        return response()->json(['message' => 'Invalid internal ingestion request.'], 401);
    }
}
