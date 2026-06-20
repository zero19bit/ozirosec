<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\UserAdministrationPolicy;
use App\Support\ProductionConfigurationValidator;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->app->make(ProductionConfigurationValidator::class)->validate();
        $this->configureTrustedProxies();
        Gate::policy(User::class, UserAdministrationPolicy::class);
        $this->configureEmailVerificationUrls();
        $this->configureRateLimiters();
    }

    private function configureRateLimiters(): void
    {
        RateLimiter::for('api', static function (Request $request): Limit {
            return Limit::perMinute(60)->by(
                $request->user()?->getAuthIdentifier() ?: $request->ip()
            );
        });

        // Registration is public, so it is primarily IP-bound with a browser-signal backstop.
        RateLimiter::for('hackpath.registration', function (Request $request): array {
            return [
                $this->limit('hackpath.registration.ip', 5)->by($this->ipKey($request)),
                $this->limit('hackpath.registration.agent', 12)->by($this->ipKey($request).'|'.$this->userAgentKey($request)),
            ];
        });

        // Login combines a normalized email digest and trusted-proxy-aware IP to avoid plaintext identity keys.
        RateLimiter::for('hackpath.login', function (Request $request): array {
            return [
                $this->limit('hackpath.login.identity_ip', 5)->by($this->emailIpKey($request)),
                $this->limit('hackpath.login.ip', 20)->by($this->ipKey($request)),
            ];
        });

        // Verification resend is user-bound, with IP protection for scripted browser abuse.
        RateLimiter::for('hackpath.email_resend', function (Request $request): array {
            return [
                $this->limit('hackpath.email_resend.user', 6)->by($this->userKey($request)),
                $this->limit('hackpath.email_resend.ip', 20)->by($this->ipKey($request)),
            ];
        });

        // Password reset is reserved for future routes and mirrors login without revealing account existence.
        RateLimiter::for('hackpath.password_reset', function (Request $request): array {
            return [
                $this->limit('hackpath.password_reset.identity_ip', 5)->by($this->emailIpKey($request)),
                $this->limit('hackpath.password_reset.ip', 20)->by($this->ipKey($request)),
            ];
        });

        // Profile mutations are authenticated and user-bound, with a defensive IP ceiling.
        RateLimiter::for('hackpath.profile_mutation', function (Request $request): array {
            return [
                $this->limit('hackpath.profile_mutation.user', 20)->by($this->userKey($request)),
                $this->limit('hackpath.profile_mutation.ip', 60)->by($this->ipKey($request)),
            ];
        });

        // Lab submissions are isolated by user ID so shared NAT users do not consume each other's quota.
        RateLimiter::for('hackpath.lab_submission', function (Request $request): array {
            return [
                $this->limit('hackpath.lab_submission.user', 30)->by($this->userKey($request)),
                $this->limit('hackpath.lab_submission.ip', 120)->by($this->ipKey($request)),
            ];
        });

        // Admin read operations can be burstier but are still scoped to the administrator account.
        RateLimiter::for('hackpath.admin_read', function (Request $request): Limit {
            return $this->limit('hackpath.admin_read.user', 120)->by($this->userKey($request));
        });

        // Admin mutations are stricter than reads because they can change account privileges.
        RateLimiter::for('hackpath.admin_mutation', function (Request $request): Limit {
            return $this->limit('hackpath.admin_mutation.user', 20)->by($this->userKey($request));
        });

        // Logout-all-devices is reserved for a future sensitive session-management route.
        RateLimiter::for('hackpath.logout_all_devices', function (Request $request): array {
            return [
                $this->limit('hackpath.logout_all_devices.user', 5)->by($this->userKey($request)),
                $this->limit('hackpath.logout_all_devices.ip', 10)->by($this->ipKey($request)),
            ];
        });

        // Expensive reporting or search endpoints should use this limiter when added.
        RateLimiter::for('hackpath.expensive_read', function (Request $request): array {
            return [
                $this->limit('hackpath.expensive_read.actor', 30)->by($this->userKey($request)),
                $this->limit('hackpath.expensive_read.ip', 60)->by($this->ipKey($request)),
            ];
        });
    }

    private function limit(string $name, int $maxAttempts): Limit
    {
        return Limit::perMinute($maxAttempts)->response(function (Request $request, array $headers) use ($name) {
            Log::warning('Rate limit exceeded.', [
                'limiter' => $name,
                'route' => $request->route()?->getName(),
                'user_id' => $request->user()?->getAuthIdentifier(),
                'ip_digest' => hash('sha256', (string) $request->ip()),
                'user_agent_digest' => hash('sha256', (string) $request->userAgent()),
            ]);

            $retryAfter = isset($headers['Retry-After']) ? (int) $headers['Retry-After'] : null;

            return response()->json([
                'message' => 'Too many requests.',
                'errors' => [
                    'rate_limit' => ['Too many requests. Please retry later.'],
                ],
                'retry_after' => $retryAfter,
            ], 429, $headers);
        });
    }

    private function userKey(Request $request): string
    {
        $userId = $request->user()?->getAuthIdentifier() ?? Auth::guard('web')->id();

        return $userId !== null ? 'user:'.$userId : $this->ipKey($request);
    }

    private function emailIpKey(Request $request): string
    {
        $email = is_string($request->input('email')) ? strtolower(trim($request->input('email'))) : '';

        return 'email:'.hash('sha256', $email).'|'.$this->ipKey($request);
    }

    private function ipKey(Request $request): string
    {
        return 'ip:'.hash('sha256', (string) $request->ip());
    }

    private function userAgentKey(Request $request): string
    {
        return 'ua:'.hash('sha256', (string) $request->userAgent());
    }

    private function configureTrustedProxies(): void
    {
        $trustedProxies = config('hackpath.trusted_proxies.proxies', []);

        if (is_array($trustedProxies) && $trustedProxies !== []) {
            TrustProxies::at($trustedProxies);
        }
    }

    private function configureEmailVerificationUrls(): void
    {
        VerifyEmail::createUrlUsing(static function (User $user): string {
            return URL::temporarySignedRoute(
                'api.v1.verification.verify',
                now()->addMinutes((int) config('auth.verification.expire', 60)),
                [
                    'id' => $user->getKey(),
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );
        });
    }
}
