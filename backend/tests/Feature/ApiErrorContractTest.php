<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

final class ApiErrorContractTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    public function test_unauthenticated_error_contract(): void
    {
        $this->getJson('/api/v1/user')
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'Unauthenticated.']);
    }

    public function test_unauthorized_error_contract(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $this->actingAs($user)
            ->getJson('/api/v1/admin/metrics')
            ->assertForbidden()
            ->assertJsonStructure(['message'])
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('trace');
    }

    public function test_not_found_error_contract(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/users/999999', ['role' => UserRole::User->value])
            ->assertNotFound()
            ->assertJsonStructure(['message'])
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('trace');
    }

    public function test_throttled_error_contract(): void
    {
        for ($attempt = 0; $attempt < 7; $attempt++) {
            $response = $this->postJson('/api/v1/login', [
                'email' => 'missing@example.test',
                'password' => 'WrongPass!42',
            ]);
        }

        $response
            ->assertTooManyRequests()
            ->assertJsonStructure([
                'message',
                'errors' => ['rate_limit'],
                'retry_after',
            ]);
    }

    public function test_suspended_error_contract(): void
    {
        $user = User::factory()->create(['suspended_at' => now()]);

        $this->actingAs($user)
            ->getJson('/api/v1/user')
            ->assertForbidden()
            ->assertJsonStructure(['message'])
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('trace');
    }

    public function test_production_internal_error_contract_does_not_expose_internals(): void
    {
        Route::get('/api/v1/__test-internal-error', static function (): never {
            throw new RuntimeException('SQLSTATE[HY000] /var/www/html/.env secret failure');
        })->middleware('api');

        $this->app['config']->set('app.debug', false);

        $this->getJson('/api/v1/__test-internal-error')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Server Error'])
            ->assertJsonMissingPath('exception')
            ->assertJsonMissingPath('trace');
    }

    public function test_csrf_error_contract(): void
    {
        $this->app->instance('env', 'local');

        User::factory()->create([
            'email' => 'csrf-contract@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->withHeader('Referer', self::FRONTEND_ORIGIN.'/')
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/v1/login', [
                'email' => 'csrf-contract@example.test',
                'password' => 'StrongPass!42',
            ])
            ->assertStatus(419)
            ->assertExactJson(['message' => 'CSRF token mismatch or session expired.']);
    }
}
