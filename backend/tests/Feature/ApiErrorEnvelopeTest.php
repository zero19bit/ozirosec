<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class ApiErrorEnvelopeTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    public function test_json_404_uses_consistent_message_envelope(): void
    {
        $this->getJson('/api/v1/not-a-real-route')
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }

    public function test_validation_errors_use_laravel_json_envelope(): void
    {
        $this->statefulPost('/api/v1/register', [])
            ->assertUnprocessable()
            ->assertJsonStructure([
                'message',
                'errors' => [
                    'username',
                    'email',
                    'password',
                ],
            ]);
    }

    public function test_csrf_errors_use_json_message_envelope(): void
    {
        $this->app->instance('env', 'local');

        User::factory()->create([
            'email' => 'analyst@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $this->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withHeader('Accept', 'application/json')
            ->postJson('/api/v1/login', [
                'email' => 'analyst@example.test',
                'password' => 'StrongPass!42',
            ])
            ->assertStatus(419)
            ->assertJsonStructure(['message']);
    }

    private function statefulPost(string $uri, array $payload = []): TestResponse
    {
        $csrfToken = 'known-csrf-token';

        return $this
            ->withSession(['_token' => $csrfToken])
            ->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->withHeader('Referer', self::FRONTEND_ORIGIN.'/')
            ->withHeader('Accept', 'application/json')
            ->withHeader('X-CSRF-TOKEN', $csrfToken)
            ->postJson($uri, $payload);
    }
}
