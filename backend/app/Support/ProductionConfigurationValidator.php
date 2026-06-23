<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use RuntimeException;

final readonly class ProductionConfigurationValidator
{
    /**
     * @var list<string>
     */
    private const INSECURE_ADMIN_PASSWORD_FRAGMENTS = [
        'admin',
        'password',
        'changeme',
        'change-me',
        'change_me',
        '123456',
        'hackpath',
        'project',
        'default',
        'example',
    ];

    public function __construct(
        private ConfigRepository $config,
    ) {}

    public function validate(): void
    {
        if (! $this->shouldValidate()) {
            return;
        }

        $failures = array_filter([
            $this->validateDebugDisabled(),
            $this->validateAppKey(),
            $this->validateHttpsUrl('app.url', $this->config->get('app.url')),
            $this->validateHttpsUrl('hackpath.frontend_url', $this->config->get('hackpath.frontend_url')),
            $this->validateSessionSecureCookie(),
            $this->validateSessionHttpOnly(),
            $this->validateSessionSameSite(),
            $this->validateCors(),
            $this->validateAdminBootstrapCredentials(),
            $this->validateAdminPassword(),
            $this->validateActiveLabSecrets(),
            $this->validateDatabase(),
            $this->validateTrustedProxies(),
        ]);

        if ($failures !== []) {
            throw new RuntimeException(
                "Unsafe production configuration detected:\n- ".implode("\n- ", $failures)
            );
        }
    }

    public function shouldValidate(): bool
    {
        return $this->config->get('app.env') === 'production'
            || $this->config->get('hackpath.enforce_production_config') === true;
    }

    private function validateDebugDisabled(): ?string
    {
        return $this->config->get('app.debug') === true
            ? 'app.debug must be false in production. Set APP_DEBUG=false.'
            : null;
    }

    private function validateAppKey(): ?string
    {
        $key = $this->config->get('app.key');

        if (! is_string($key) || trim($key) === '') {
            return 'app.key is missing. Generate and configure APP_KEY before production startup.';
        }

        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);

            return $decoded !== false && strlen($decoded) === 32
                ? null
                : 'app.key is malformed. Use php artisan key:generate and deploy the generated APP_KEY.';
        }

        return strlen($key) === 32
            ? null
            : 'app.key is malformed. Use a valid Laravel AES-256 key.';
    }

    private function validateHttpsUrl(string $key, mixed $value): ?string
    {
        if (! is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
            return "{$key} must be a valid HTTPS URL in production.";
        }

        return parse_url($value, PHP_URL_SCHEME) === 'https'
            ? null
            : "{$key} must use HTTPS in production.";
    }

    private function validateSessionSecureCookie(): ?string
    {
        return $this->config->get('session.secure') === true
            ? null
            : 'session.secure must be true in production. Set SESSION_SECURE_COOKIE=true.';
    }

    private function validateSessionHttpOnly(): ?string
    {
        return $this->config->get('session.http_only') === true
            ? null
            : 'session.http_only must be true in production. Set SESSION_HTTP_ONLY=true.';
    }

    private function validateSessionSameSite(): ?string
    {
        $sameSite = $this->normalizedString($this->config->get('session.same_site'));
        $secure = $this->config->get('session.secure') === true;

        if (! in_array($sameSite, ['lax', 'strict', 'none'], true)) {
            return 'session.same_site must be lax, strict, or none in production.';
        }

        if ($sameSite === 'none' && ! $secure) {
            return 'session.same_site=none requires SESSION_SECURE_COOKIE=true.';
        }

        if ($this->isCrossSiteSpa() && $sameSite !== 'none') {
            return 'session.same_site must be none for a credentialed cross-site SPA deployment.';
        }

        return null;
    }

    private function validateCors(): ?string
    {
        $origins = $this->arrayConfig('cors.allowed_origins');

        if ($this->shouldValidate() && $origins === []) {
            return 'cors.allowed_origins must contain at least one explicit HTTPS origin in production.';
        }

        foreach ($origins as $origin) {
            if ($origin === '*') {
                return 'cors allowed origins must not contain wildcards in production.';
            }

            if (! is_string($origin) || filter_var($origin, FILTER_VALIDATE_URL) === false) {
                return 'cors.allowed_origins must contain valid origins only.';
            }

            $scheme = parse_url($origin, PHP_URL_SCHEME);
            $host = parse_url($origin, PHP_URL_HOST);

            if ($this->shouldValidate() && $scheme !== 'https') {
                return 'cors.allowed_origins must use HTTPS in production.';
            }

            if ($this->shouldValidate() && is_string($host) && $this->isLocalhost($host)) {
                return 'cors.allowed_origins must not include localhost in production.';
            }
        }

        if ($this->config->get('cors.supports_credentials') !== true) {
            return null;
        }

        $patterns = $this->arrayConfig('cors.allowed_origins_patterns');

        $hasWildcardOrigin = in_array('*', $origins, true);
        $hasWildcardPattern = collect($patterns)->contains(static fn (mixed $pattern): bool => is_string($pattern)
            && ($pattern === '*' || str_contains($pattern, '.*') || str_contains($pattern, '*')));

        return $hasWildcardOrigin || $hasWildcardPattern
            ? 'cors allowed origins must not contain wildcards when supports_credentials is true.'
            : null;
    }

    private function validateAdminBootstrapCredentials(): ?string
    {
        if ($this->config->get('hackpath.auth.admin.bootstrap_enabled') !== true) {
            return null;
        }

        $name = $this->config->get('hackpath.auth.admin.name');
        $email = $this->config->get('hackpath.auth.admin.email');
        $password = $this->config->get('hackpath.auth.admin.password');

        if (! is_string($name) || trim($name) === ''
            || ! is_string($email) || filter_var($email, FILTER_VALIDATE_EMAIL) === false
            || ! is_string($password) || trim($password) === '') {
            return 'hackpath.auth.admin bootstrap credentials are incomplete. Configure HACKPATH_ADMIN_NAME, HACKPATH_ADMIN_EMAIL, and HACKPATH_ADMIN_PASSWORD or disable bootstrap.';
        }

        return null;
    }

    private function validateAdminPassword(): ?string
    {
        $password = $this->config->get('hackpath.auth.admin.password');

        if (! is_string($password) || trim($password) === '') {
            return null;
        }

        $normalized = strtolower($password);

        foreach (self::INSECURE_ADMIN_PASSWORD_FRAGMENTS as $fragment) {
            if (str_contains($normalized, $fragment)) {
                return 'hackpath.auth.admin.password appears to contain an insecure placeholder. Configure a unique high-entropy administrator bootstrap password.';
            }
        }

        if (strlen($password) < 16
            || preg_match('/[a-z]/', $password) !== 1
            || preg_match('/[A-Z]/', $password) !== 1
            || preg_match('/\d/', $password) !== 1
            || preg_match('/[^A-Za-z0-9]/', $password) !== 1) {
            return 'hackpath.auth.admin.password must be at least 16 characters and contain upper-case, lower-case, numeric, and symbol characters in production.';
        }

        return null;
    }

    private function validateActiveLabSecrets(): ?string
    {
        $labs = $this->config->get('vulnerabilities.labs', []);

        if (! is_array($labs)) {
            return 'vulnerabilities.labs must be an array.';
        }

        $activeLabs = array_filter($labs, static fn (mixed $lab): bool => is_array($lab) && ($lab['active'] ?? false) === true);

        if ($activeLabs === []) {
            return null;
        }

        $secret = $this->config->get('vulnerabilities.flag_secret');
        if (! is_string($secret) || strlen(trim($secret)) < 32 || $this->isPlaceholder($secret)) {
            return 'vulnerabilities.flag_secret must be a unique server-only value of at least 32 characters when active labs are configured. Set HACKPATH_FLAG_SECRET.';
        }

        foreach ($activeLabs as $key => $lab) {
            $digest = $lab['expected_digest'] ?? null;
            if (! is_string($digest) || trim($digest) === '') {
                return "vulnerabilities.labs.{$key}.expected_digest is required for active labs.";
            }
        }

        return null;
    }

    private function validateDatabase(): ?string
    {
        if ($this->config->get('database.default') !== 'sqlite') {
            return null;
        }

        $database = $this->config->get('database.connections.sqlite.database');

        return is_string($database) && str_ends_with(str_replace('\\', '/', $database), '/database/database.sqlite')
            ? 'database.default must not use the local database.sqlite file in production.'
            : null;
    }

    private function validateTrustedProxies(): ?string
    {
        $proxies = $this->arrayConfig('hackpath.trusted_proxies.proxies');
        $documentationUrl = $this->config->get('hackpath.trusted_proxies.documentation_url');

        $dangerouslyBroad = collect($proxies)->contains(static fn (mixed $proxy): bool => in_array($proxy, ['*', '**', '0.0.0.0/0', '::/0'], true));

        return $dangerouslyBroad && (! is_string($documentationUrl) || filter_var($documentationUrl, FILTER_VALIDATE_URL) === false)
            ? 'hackpath.trusted_proxies.documentation_url is required when TRUSTED_PROXIES is broad.'
            : null;
    }

    private function isCrossSiteSpa(): bool
    {
        if ($this->config->get('cors.supports_credentials') !== true) {
            return false;
        }

        $appHost = parse_url((string) $this->config->get('app.url'), PHP_URL_HOST);
        $frontendHost = parse_url((string) $this->config->get('hackpath.frontend_url'), PHP_URL_HOST);

        return is_string($appHost) && is_string($frontendHost) && $appHost !== $frontendHost;
    }

    /**
     * @return list<mixed>
     */
    private function arrayConfig(string $key): array
    {
        $value = $this->config->get($key, []);

        return is_array($value) ? array_values($value) : [];
    }

    private function normalizedString(mixed $value): string
    {
        return is_string($value) ? strtolower($value) : '';
    }

    private function isLocalhost(string $host): bool
    {
        return in_array(strtolower($host), ['localhost', '127.0.0.1', '::1'], true);
    }

    private function isPlaceholder(string $value): bool
    {
        return preg_match('/(?:replace|change|example|placeholder|your[-_ ]?(?:secret|key|password))/i', $value) === 1;
    }
}
