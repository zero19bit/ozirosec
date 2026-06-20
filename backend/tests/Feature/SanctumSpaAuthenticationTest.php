<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class SanctumSpaAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    public function test_registration_creates_authenticated_session_without_token_response(): void
    {
        $response = $this->statefulPost('/api/v1/register', [
            'username' => 'newanalyst',
            'email' => 'newanalyst@example.test',
            'password' => 'StrongPass!42',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'newanalyst@example.test')
            ->assertJsonMissingPath('data.token')
            ->assertJsonMissingPath('data.access_token')
            ->assertJsonMissingPath('data.token_type');

        $this->assertAuthenticated('web');
        $this->assertSame(0, DB::table('personal_access_tokens')->count());
    }

    public function test_login_creates_authenticated_session_without_personal_access_token(): void
    {
        $user = User::factory()->create([
            'email' => 'analyst@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $response = $this->statefulPost('/api/v1/login', [
            'email' => 'analyst@example.test',
            'password' => 'StrongPass!42',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->getKey())
            ->assertJsonMissingPath('data.token')
            ->assertJsonMissingPath('data.access_token')
            ->assertJsonMissingPath('data.token_type');

        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame(0, DB::table('personal_access_tokens')->count());
    }

    public function test_login_regenerates_session_id(): void
    {
        User::factory()->create([
            'email' => 'regen@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this->withSession(['_token' => 'known-csrf-token']);
        $before = Session::getId();

        $this
            ->withStatefulHeaders()
            ->withHeader('X-CSRF-TOKEN', 'known-csrf-token')
            ->postJson('/api/v1/login', [
                'email' => 'regen@example.test',
                'password' => 'StrongPass!42',
            ])
            ->assertOk();

        $this->assertNotSame($before, Session::getId());
    }

    public function test_invalid_credentials_return_validation_errors(): void
    {
        User::factory()->create([
            'email' => 'wrong@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this->statefulPost('/api/v1/login', [
            'email' => 'wrong@example.test',
            'password' => 'bad-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_suspended_user_login_returns_forbidden(): void
    {
        User::factory()->create([
            'email' => 'suspended@example.test',
            'password' => Hash::make('StrongPass!42'),
            'suspended_at' => now(),
        ]);

        $this->statefulPost('/api/v1/login', [
            'email' => 'suspended@example.test',
            'password' => 'StrongPass!42',
        ])
            ->assertForbidden()
            ->assertJsonPath('message', 'This account is suspended.');
    }

    public function test_authenticated_user_endpoint_returns_sanitized_user(): void
    {
        $user = User::factory()->create();

        $this
            ->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->getKey())
            ->assertJsonMissingPath('data.user.password')
            ->assertJsonMissingPath('data.user.remember_token');
    }

    public function test_unauthenticated_user_endpoint_returns_json_unauthorized(): void
    {
        $this
            ->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_csrf_protection_blocks_stateful_mutation_without_token(): void
    {
        $this->app->instance('env', 'local');

        User::factory()->create([
            'email' => 'csrf@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this
            ->withStatefulHeaders()
            ->postJson('/api/v1/login', [
                'email' => 'csrf@example.test',
                'password' => 'StrongPass!42',
            ])
            ->assertStatus(419)
            ->assertJsonPath('message', 'CSRF token mismatch or session expired.');
    }

    public function test_logout_invalidates_session(): void
    {
        User::factory()->create([
            'email' => 'logout@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this->statefulPost('/api/v1/login', [
            'email' => 'logout@example.test',
            'password' => 'StrongPass!42',
        ])->assertOk();

        $this->statefulPost('/api/v1/logout')
            ->assertOk()
            ->assertJsonPath('data.authenticated', false);

        $this->assertGuest('web');
    }

    public function test_suspended_existing_session_is_rejected_and_logged_out(): void
    {
        $user = User::factory()->create([
            'suspended_at' => now(),
        ]);

        $this
            ->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertForbidden()
            ->assertJsonPath('message', 'This account is suspended.');

        $this->assertGuest('web');
    }

    public function test_non_stateful_origin_does_not_use_browser_session_flow(): void
    {
        User::factory()->create([
            'email' => 'origin@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this
            ->withHeader('Origin', 'http://evil.example')
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/v1/login', [
                'email' => 'origin@example.test',
                'password' => 'StrongPass!42',
            ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Stateful SPA session required.');
    }

    private function statefulPost(string $uri, array $payload = []): TestResponse
    {
        $csrfToken = 'known-csrf-token';

        return $this
            ->withSession(['_token' => $csrfToken])
            ->withStatefulHeaders()
            ->withHeader('X-CSRF-TOKEN', $csrfToken)
            ->postJson($uri, $payload);
    }

    private function withStatefulHeaders(): self
    {
        return $this
            ->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->withHeader('Referer', self::FRONTEND_ORIGIN.'/')
            ->withHeader('Accept', 'application/json');
    }
}
