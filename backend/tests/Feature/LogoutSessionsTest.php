<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class LogoutSessionsTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    private const PASSWORD = 'StrongPass!42';

    public function test_current_session_logout_invalidates_current_session(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/logout')
            ->assertOk()
            ->assertJsonPath('data.authenticated', false);

        $this->assertGuest('web');

        $this->app['auth']->forgetGuards();

        $this->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertUnauthorized();
    }

    public function test_second_browser_session_remains_active_after_normal_logout(): void
    {
        Config::set('session.driver', 'database');
        $user = User::factory()->create();
        $secondSessionId = 'second-browser-session';

        $this->withSession(['_token' => 'known-csrf-token']);
        $currentSessionId = Session::getId();

        $this->storeSession($currentSessionId, $user->getKey());
        $this->storeSession($secondSessionId, $user->getKey());

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->withHeader('X-CSRF-TOKEN', 'known-csrf-token')
            ->postJson('/api/v1/logout')
            ->assertOk();

        $this->assertDatabaseHas('sessions', ['id' => $secondSessionId, 'user_id' => $user->getKey()]);
    }

    public function test_all_device_logout_invalidates_every_session(): void
    {
        Config::set('session.driver', 'database');
        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
            'remember_token' => 'old-remember-token',
        ]);

        $this->storeSession('first-session', $user->getKey());
        $this->storeSession('second-session', $user->getKey());

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/auth/logout-all', ['current_password' => self::PASSWORD])
            ->assertOk()
            ->assertJsonPath('data.authenticated', false)
            ->assertJsonMissingPath('data.sessions');

        $this->assertDatabaseMissing('sessions', ['user_id' => $user->getKey()]);
        $this->assertNotSame('old-remember-token', $user->fresh()->remember_token);
        $this->assertGuest('web');
    }

    public function test_incorrect_current_password_rejected(): void
    {
        Config::set('session.driver', 'database');
        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->storeSession('kept-session', $user->getKey());

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/auth/logout-all', ['current_password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);

        $this->assertDatabaseHas('sessions', ['id' => 'kept-session', 'user_id' => $user->getKey()]);
    }

    public function test_csrf_required_for_all_device_logout(): void
    {
        $this->app->instance('env', 'local');
        Config::set('session.driver', 'database');

        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/auth/logout-all', ['current_password' => self::PASSWORD])
            ->assertStatus(419);
    }

    public function test_suspended_user_is_rejected_and_logged_out(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
            'suspended_at' => now(),
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/auth/logout-all', ['current_password' => self::PASSWORD])
            ->assertForbidden()
            ->assertJsonPath('message', 'This account is suspended.');

        $this->assertGuest('web');
    }

    public function test_already_logged_out_request_returns_unauthorized(): void
    {
        $this->withStatefulHeaders()
            ->postJson('/api/v1/logout')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_old_session_cookie_rejected_after_logout(): void
    {
        User::factory()->create([
            'email' => 'old-session@example.test',
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->statefulPost('/api/v1/login', [
            'email' => 'old-session@example.test',
            'password' => self::PASSWORD,
        ])->assertOk();

        $this->statefulPost('/api/v1/logout')->assertOk();

        $this->app['auth']->forgetGuards();

        $this->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertUnauthorized();
    }

    public function test_session_fixation_protection_remains_intact(): void
    {
        User::factory()->create([
            'email' => 'fixation@example.test',
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->withSession(['_token' => 'known-csrf-token']);
        $before = Session::getId();

        $this
            ->withStatefulHeaders()
            ->withHeader('X-CSRF-TOKEN', 'known-csrf-token')
            ->postJson('/api/v1/login', [
                'email' => 'fixation@example.test',
                'password' => self::PASSWORD,
            ])
            ->assertOk();

        $this->assertNotSame($before, Session::getId());
    }

    public function test_all_device_logout_requires_database_session_driver(): void
    {
        Config::set('session.driver', 'array');
        $user = User::factory()->create([
            'password' => Hash::make(self::PASSWORD),
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/auth/logout-all', ['current_password' => self::PASSWORD])
            ->assertStatus(409)
            ->assertJsonPath('message', 'All-device logout requires the database session driver with a sessions.user_id column.');
    }

    private function statefulPost(string $uri, array $payload = []): TestResponse
    {
        return $this->withStatefulHeaders()->postJson($uri, $payload);
    }

    private function withStatefulHeaders(): self
    {
        return $this
            ->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->withHeader('Referer', self::FRONTEND_ORIGIN.'/')
            ->withHeader('Accept', 'application/json');
    }

    private function storeSession(string $sessionId, int|string $userId): void
    {
        DB::table('sessions')->insert([
            'id' => $sessionId,
            'user_id' => $userId,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Feature Test Browser',
            'payload' => base64_encode('test-payload'),
            'last_activity' => now()->timestamp,
        ]);
    }
}
