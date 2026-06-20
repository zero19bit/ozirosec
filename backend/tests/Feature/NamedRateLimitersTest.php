<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class NamedRateLimitersTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Notification::fake();
        Config::set('vulnerabilities.labs', []);
    }

    public function test_login_limiter_activates(): void
    {
        User::factory()->create([
            'email' => 'limited@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->statefulPost('/api/v1/login', [
                'email' => 'limited@example.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        $this->statefulPost('/api/v1/login', [
            'email' => 'limited@example.test',
            'password' => 'wrong-password',
        ])
            ->assertTooManyRequests()
            ->assertJsonPath('message', 'Too many requests.')
            ->assertHeader('Retry-After')
            ->assertHeader('X-RateLimit-Limit');
    }

    public function test_login_failure_does_not_create_account_enumeration_difference(): void
    {
        User::factory()->create([
            'email' => 'known@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $known = $this->statefulPost('/api/v1/login', [
            'email' => 'known@example.test',
            'password' => 'wrong-password',
        ]);

        $unknown = $this->statefulPost('/api/v1/login', [
            'email' => 'unknown@example.test',
            'password' => 'wrong-password',
        ]);

        $known->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $unknown->assertUnprocessable()->assertJsonValidationErrors(['email']);
        $this->assertSame($known->json('errors.email'), $unknown->json('errors.email'));
    }

    public function test_registration_limiter_activates(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->statefulPost('/api/v1/register', [
                'username' => 'rateuser'.$attempt,
                'email' => "rateuser{$attempt}@example.test",
                'password' => 'StrongPass!42',
            ])->assertCreated();
        }

        $this->statefulPost('/api/v1/register', [
            'username' => 'rateuser-last',
            'email' => 'rateuser-last@example.test',
            'password' => 'StrongPass!42',
        ])
            ->assertTooManyRequests()
            ->assertJsonPath('message', 'Too many requests.');
    }

    public function test_resend_limiter_activates(): void
    {
        $user = User::factory()->unverified()->create();

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->actingAs($user, 'web')
                ->withStatefulHeaders()
                ->postJson('/api/v1/email/verification-notification')
                ->assertOk();
        }

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->postJson('/api/v1/email/verification-notification')
            ->assertTooManyRequests()
            ->assertJsonPath('errors.rate_limit.0', 'Too many requests. Please retry later.');
    }

    public function test_lab_limiter_is_isolated_per_user(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        for ($attempt = 0; $attempt < 30; $attempt++) {
            $this->actingAs($firstUser, 'web')
                ->withStatefulHeaders()
                ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
                ->postJson('/api/v1/labs/verify', ['lab_key' => 'unknown', 'flag' => 'wrong'])
                ->assertOk();
        }

        $this->actingAs($firstUser, 'web')
            ->withStatefulHeaders()
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'unknown', 'flag' => 'wrong'])
            ->assertTooManyRequests();

        $this->app['auth']->forgetGuards();

        $this->actingAs($secondUser, 'web')
            ->withStatefulHeaders()
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'unknown', 'flag' => 'wrong'])
            ->assertOk();
    }

    public function test_two_users_behind_same_ip_do_not_share_entire_user_quota(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        for ($attempt = 0; $attempt < 30; $attempt++) {
            $this->actingAs($firstUser, 'web')
                ->withStatefulHeaders()
                ->withServerVariables(['REMOTE_ADDR' => '198.51.100.44'])
                ->postJson('/api/v1/labs/verify', ['lab_key' => 'unknown', 'flag' => 'wrong'])
                ->assertOk();
        }

        $this->app['auth']->forgetGuards();

        $this->actingAs($secondUser, 'web')
            ->withStatefulHeaders()
            ->withServerVariables(['REMOTE_ADDR' => '198.51.100.44'])
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'unknown', 'flag' => 'wrong'])
            ->assertOk();
    }

    public function test_admin_mutation_limiter_is_stricter_than_admin_read_limiter(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create();

        for ($attempt = 0; $attempt < 20; $attempt++) {
            $this->actingAs($admin, 'web')
                ->withStatefulHeaders()
                ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::Admin->value])
                ->assertOk();
        }

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::Admin->value])
            ->assertTooManyRequests();

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->getJson('/api/v1/admin/metrics')
            ->assertOk();
    }

    public function test_retry_headers_exist_where_supported(): void
    {
        User::factory()->create([
            'email' => 'headers@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->statefulPost('/api/v1/login', [
                'email' => 'headers@example.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        $this->statefulPost('/api/v1/login', [
            'email' => 'headers@example.test',
            'password' => 'wrong-password',
        ])
            ->assertTooManyRequests()
            ->assertHeader('Retry-After')
            ->assertHeader('X-RateLimit-Remaining');
    }

    public function test_limiter_resets_after_expected_period(): void
    {
        User::factory()->create([
            'email' => 'reset@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->statefulPost('/api/v1/login', [
                'email' => 'reset@example.test',
                'password' => 'wrong-password',
            ])->assertUnprocessable();
        }

        $this->statefulPost('/api/v1/login', [
            'email' => 'reset@example.test',
            'password' => 'wrong-password',
        ])->assertTooManyRequests();

        $this->travel(61)->seconds();

        $this->statefulPost('/api/v1/login', [
            'email' => 'reset@example.test',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_suspended_users_cannot_bypass_limits(): void
    {
        User::factory()->create([
            'email' => 'suspended-limited@example.test',
            'password' => Hash::make('StrongPass!42'),
            'suspended_at' => now(),
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->statefulPost('/api/v1/login', [
                'email' => 'suspended-limited@example.test',
                'password' => 'StrongPass!42',
            ])->assertForbidden();
        }

        $this->statefulPost('/api/v1/login', [
            'email' => 'suspended-limited@example.test',
            'password' => 'StrongPass!42',
        ])->assertTooManyRequests();
    }

    private function statefulPost(string $uri, array $payload): TestResponse
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
}
