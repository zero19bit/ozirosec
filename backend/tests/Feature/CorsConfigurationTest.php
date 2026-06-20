<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Support\CorsOriginParser;
use App\Support\ProductionConfigurationValidator;
use Illuminate\Support\Facades\Config;
use InvalidArgumentException;
use RuntimeException;
use Tests\TestCase;

final class CorsConfigurationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Config::set('cors.paths', ['api/*', 'sanctum/csrf-cookie']);
        Config::set('cors.allowed_methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
        Config::set('cors.allowed_headers', ['Accept', 'Content-Type', 'Origin', 'X-Requested-With', 'X-XSRF-TOKEN']);
        Config::set('cors.exposed_headers', []);
        Config::set('cors.max_age', 600);
        Config::set('cors.supports_credentials', true);
        Config::set('cors.allowed_origins_patterns', []);
    }

    public function test_allowed_development_origin_receives_cors_headers(): void
    {
        Config::set('cors.allowed_origins', ['http://localhost:5173']);

        $this->getJson('/api/v1/user', [
            'Origin' => 'http://localhost:5173',
        ])
            ->assertUnauthorized()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_rejected_unknown_origin_receives_no_permissive_cors_headers(): void
    {
        Config::set('cors.allowed_origins', ['http://localhost:5173']);

        $response = $this->getJson('/api/v1/user', [
            'Origin' => 'https://evil.example.test',
        ]);

        $response->assertUnauthorized();
        $this->assertNotSame('https://evil.example.test', $response->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_allowed_production_https_origin_passes_validation(): void
    {
        $this->validProductionConfig();
        Config::set('cors.allowed_origins', ['https://app.example.test']);

        app(ProductionConfigurationValidator::class)->validate();

        $this->assertSame(['https://app.example.test'], Config::get('cors.allowed_origins'));
    }

    public function test_rejected_production_http_origin(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('HTTPS');

        CorsOriginParser::fromCommaSeparated('http://app.example.test', 'production');
    }

    public function test_preflight_request_uses_limited_methods_and_headers(): void
    {
        Config::set('cors.allowed_origins', ['http://localhost:5173']);

        $response = $this->options('/api/v1/labs/verify', [], [
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'Content-Type, X-XSRF-TOKEN, X-Requested-With',
        ]);

        $response
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true')
            ->assertHeader('Access-Control-Max-Age', '600');

        $allowedMethods = (string) $response->headers->get('Access-Control-Allow-Methods');
        $allowedHeaders = (string) $response->headers->get('Access-Control-Allow-Headers');

        $this->assertStringContainsString('POST', $allowedMethods);
        $this->assertStringContainsString('OPTIONS', $allowedMethods);
        $this->assertStringContainsString('content-type', strtolower($allowedHeaders));
        $this->assertStringContainsString('x-xsrf-token', strtolower($allowedHeaders));
        $this->assertStringNotContainsString('authorization', strtolower($allowedHeaders));
    }

    public function test_credentialed_request_does_not_expose_authorization_header(): void
    {
        Config::set('cors.allowed_origins', ['http://localhost:5173']);

        $response = $this->getJson('/api/v1/user', [
            'Origin' => 'http://localhost:5173',
            'Cookie' => 'XSRF-TOKEN=test',
        ]);

        $response
            ->assertUnauthorized()
            ->assertHeader('Access-Control-Allow-Credentials', 'true');

        $this->assertFalse($response->headers->has('Access-Control-Expose-Headers'));
    }

    public function test_wildcard_plus_credentials_rejected(): void
    {
        $this->validProductionConfig();
        Config::set('cors.allowed_origins', ['*']);
        Config::set('cors.supports_credentials', true);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('cors allowed origins');

        app(ProductionConfigurationValidator::class)->validate();
    }

    public function test_empty_origin_configuration_rejected_in_production(): void
    {
        $this->validProductionConfig();
        Config::set('cors.allowed_origins', []);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('cors.allowed_origins');

        app(ProductionConfigurationValidator::class)->validate();
    }

    public function test_api_response_does_not_expose_unnecessary_headers(): void
    {
        Config::set('cors.allowed_origins', ['http://localhost:5173']);

        $response = $this->getJson('/api/v1/user', [
            'Origin' => 'http://localhost:5173',
        ]);

        $response->assertUnauthorized();
        $this->assertFalse($response->headers->has('Access-Control-Expose-Headers'));
        $headers = collect($response->headers->all())
            ->flatten()
            ->implode(',');

        $this->assertStringNotContainsString('Authorization', $headers);
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
        Config::set('hackpath.auth.admin.bootstrap_enabled', false);
        Config::set('hackpath.auth.admin.name', null);
        Config::set('hackpath.auth.admin.email', null);
        Config::set('hackpath.auth.admin.password', null);
        Config::set('vulnerabilities.flag_secret', null);
        Config::set('vulnerabilities.labs', [
            'inactive-lab' => [
                'key' => 'inactive-lab',
                'title' => 'Inactive Lab',
                'vulnerability' => 'Configuration',
                'difficulty' => 'Apprentice',
                'active' => false,
                'points' => 10,
                'expected_digest' => null,
            ],
        ]);
        Config::set('database.default', 'mysql');
        Config::set('hackpath.trusted_proxies.proxies', []);
        Config::set('hackpath.trusted_proxies.documentation_url', null);
    }
}
