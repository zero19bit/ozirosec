<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\ProductionConfigurationValidator;
use Illuminate\Support\Facades\Config;
use RuntimeException;
use Tests\TestCase;

final class ProductionConfigurationValidatorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->validProductionConfig();
    }

    public function test_debug_enabled_in_production_fails(): void
    {
        Config::set('app.debug', true);

        $this->assertFailsWith('app.debug');
    }

    public function test_missing_key_in_production_fails(): void
    {
        Config::set('app.key', null);

        $this->assertFailsWith('app.key');
    }

    public function test_malformed_key_in_production_fails(): void
    {
        Config::set('app.key', 'base64:not-valid');

        $this->assertFailsWith('app.key');
    }

    public function test_http_app_url_in_production_fails(): void
    {
        Config::set('app.url', 'http://api.example.test');

        $this->assertFailsWith('app.url');
    }

    public function test_http_frontend_url_in_production_fails(): void
    {
        Config::set('hackpath.frontend_url', 'http://app.example.test');

        $this->assertFailsWith('hackpath.frontend_url');
    }

    public function test_insecure_session_cookie_configuration_fails(): void
    {
        Config::set('session.secure', false);

        $this->assertFailsWith('session.secure');
    }

    public function test_session_http_only_false_fails(): void
    {
        Config::set('session.http_only', false);

        $this->assertFailsWith('session.http_only');
    }

    public function test_unsafe_same_site_for_cross_site_spa_fails(): void
    {
        Config::set('session.same_site', 'lax');

        $this->assertFailsWith('session.same_site');
    }

    public function test_wildcard_credentialed_cors_fails(): void
    {
        Config::set('cors.allowed_origins', ['*']);
        Config::set('cors.supports_credentials', true);

        $this->assertFailsWith('cors allowed origins');
    }

    public function test_wildcard_cors_fails_even_without_credentials(): void
    {
        Config::set('cors.allowed_origins', ['*']);
        Config::set('cors.supports_credentials', false);

        $this->assertFailsWith('cors allowed origins');
    }

    public function test_missing_admin_bootstrap_credentials_fail_when_requested(): void
    {
        Config::set('hackpath.auth.admin.bootstrap_enabled', true);
        Config::set('hackpath.auth.admin.password', null);

        $this->assertFailsWith('hackpath.auth.admin bootstrap credentials');
    }

    public function test_insecure_administrator_password_fails_without_exposing_value(): void
    {
        Config::set('hackpath.auth.admin.password', 'ChangeMeExampleCredential!123');

        try {
            $this->validator()->validate();
            $this->fail('Expected production configuration validation to fail.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('hackpath.auth.admin.password', $exception->getMessage());
            $this->assertStringNotContainsString('ChangeMeExampleCredential', $exception->getMessage());
        }
    }

    public function test_administrator_password_requires_all_character_classes(): void
    {
        Config::set('hackpath.auth.admin.password', 'correcthorsebatterystaple');

        $this->assertFailsWith('hackpath.auth.admin.password');
    }

    public function test_missing_flag_secret_fails_when_active_labs_require_it(): void
    {
        Config::set('vulnerabilities.flag_secret', null);
        Config::set('vulnerabilities.labs', [
            'active-lab' => $this->labConfig(expectedDigest: str_repeat('a', 64)),
        ]);

        $this->assertFailsWith('vulnerabilities.flag_secret');
    }

    public function test_active_lab_missing_digest_fails(): void
    {
        Config::set('vulnerabilities.flag_secret', 'Fz6!wV8#rQ2@kN9$yL4%pS7^dC1&hM5*');
        Config::set('vulnerabilities.labs', [
            'active-lab' => $this->labConfig(expectedDigest: null),
        ]);

        $this->assertFailsWith('vulnerabilities.labs.active-lab.expected_digest');
    }

    public function test_local_sqlite_database_in_production_fails(): void
    {
        Config::set('database.default', 'sqlite');
        Config::set('database.connections.sqlite.database', database_path('database.sqlite'));

        $this->assertFailsWith('database.default');
    }

    public function test_broad_trusted_proxy_without_documentation_fails(): void
    {
        Config::set('hackpath.trusted_proxies.proxies', ['*']);
        Config::set('hackpath.trusted_proxies.documentation_url', null);

        $this->assertFailsWith('hackpath.trusted_proxies.documentation_url');
    }

    public function test_local_environment_remains_usable(): void
    {
        Config::set('app.env', 'local');
        Config::set('app.debug', true);
        Config::set('app.key', null);

        $this->validator()->validate();
        $this->assertTrue(true);
    }

    public function test_testing_environment_remains_usable(): void
    {
        Config::set('app.env', 'testing');
        Config::set('app.debug', true);
        Config::set('app.key', null);

        $this->validator()->validate();
        $this->assertTrue(true);
    }

    public function test_valid_production_configuration_passes_validation(): void
    {
        $this->validator()->validate();
        $this->assertTrue(true);
    }

    public function test_configuration_cache_succeeds(): void
    {
        $this->artisan('config:cache')->assertExitCode(0);
        $this->artisan('config:clear')->assertExitCode(0);
    }

    private function validProductionConfig(): void
    {
        Config::set('app.env', 'production');
        Config::set('app.debug', false);
        Config::set('app.key', 'base64:'.base64_encode(str_repeat('a', 32)));
        Config::set('app.url', 'https://api.example.test');
        Config::set('hackpath.frontend_url', 'https://app.example.test');
        Config::set('hackpath.enforce_production_config', false);
        Config::set('session.secure', true);
        Config::set('session.http_only', true);
        Config::set('session.same_site', 'none');
        Config::set('cors.supports_credentials', true);
        Config::set('cors.allowed_origins', ['https://app.example.test']);
        Config::set('cors.allowed_origins_patterns', []);
        Config::set('hackpath.auth.admin.bootstrap_enabled', false);
        Config::set('hackpath.auth.admin.name', null);
        Config::set('hackpath.auth.admin.email', null);
        Config::set('hackpath.auth.admin.password', null);
        Config::set('vulnerabilities.flag_secret', null);
        Config::set('vulnerabilities.labs', [
            'inactive-lab' => $this->labConfig(active: false, expectedDigest: null),
        ]);
        Config::set('database.default', 'mysql');
        Config::set('hackpath.trusted_proxies.proxies', []);
        Config::set('hackpath.trusted_proxies.documentation_url', null);
    }

    /**
     * @return array{key:string,title:string,vulnerability:string,difficulty:string,active:bool,points:int,expected_digest:?string}
     */
    private function labConfig(bool $active = true, ?string $expectedDigest = null): array
    {
        return [
            'key' => 'active-lab',
            'title' => 'Active Lab',
            'vulnerability' => 'Configuration',
            'difficulty' => 'Apprentice',
            'active' => $active,
            'points' => 10,
            'expected_digest' => $expectedDigest,
        ];
    }

    private function assertFailsWith(string $expectedMessage): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage($expectedMessage);

        $this->validator()->validate();
    }

    private function validator(): ProductionConfigurationValidator
    {
        return app(ProductionConfigurationValidator::class);
    }
}
