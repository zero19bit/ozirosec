<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

final class VerifyFlagRequestTest extends TestCase
{
    use RefreshDatabase;

    private const LAB_KEY = 'request-test-lab';

    private const FLAG = 'mixed case test answer 123!';

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('vulnerabilities.flag_secret', 'request-test-secret');
        Config::set('vulnerabilities.digest_algorithm', 'sha256');
        Config::set('vulnerabilities.labs', [
            self::LAB_KEY => [
                'key' => self::LAB_KEY,
                'title' => 'Request Test Lab',
                'vulnerability' => 'Request Validation',
                'difficulty' => 'Apprentice',
                'active' => true,
                'points' => 25,
                'expected_digest' => hash_hmac('sha256', self::FLAG, 'request-test-secret'),
            ],
        ]);
    }

    public function test_valid_request_reaches_verification_service(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/labs/verify', [
            'lab_key' => self::LAB_KEY,
            'flag' => self::FLAG,
            'points' => 999999,
            'active' => false,
            'completed' => true,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.lab_key', self::LAB_KEY)
            ->assertJsonPath('data.status', 'correct')
            ->assertJsonPath('data.correct', true)
            ->assertJsonPath('data.points_awarded', 25);
    }

    public function test_missing_lab_key_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', ['flag' => self::FLAG])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lab_key']);
    }

    public function test_missing_flag_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['flag']);
    }

    public function test_array_lab_key_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => [self::LAB_KEY],
            'flag' => self::FLAG,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lab_key']);
    }

    public function test_array_flag_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => self::LAB_KEY,
            'flag' => [self::FLAG],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['flag']);
    }

    public function test_null_values_return_validation_errors(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => null,
            'flag' => null,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lab_key', 'flag']);
    }

    public function test_oversized_lab_key_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => str_repeat('a', 101),
            'flag' => self::FLAG,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lab_key']);
    }

    public function test_oversized_flag_returns_validation_error(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => self::LAB_KEY,
            'flag' => str_repeat('a', 513),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['flag']);
    }

    public function test_unauthenticated_request_returns_json_unauthorized(): void
    {
        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => self::LAB_KEY,
            'flag' => self::FLAG,
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_unknown_lab_key_preserves_existing_response_format(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/labs/verify', [
            'lab_key' => 'unknown-lab',
            'flag' => self::FLAG,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.lab_key', 'unknown-lab')
            ->assertJsonPath('data.status', 'unknown_lab')
            ->assertJsonPath('data.correct', false)
            ->assertJsonPath('data.points_awarded', 0);
    }

    public function test_plaintext_flag_does_not_appear_in_response(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/labs/verify', [
            'lab_key' => self::LAB_KEY,
            'flag' => self::FLAG,
        ]);

        $response->assertOk();
        $this->assertStringNotContainsString(self::FLAG, $response->getContent());
    }

    public function test_leading_and_trailing_whitespace_is_trimmed_only(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/labs/verify', [
            'lab_key' => '  '.self::LAB_KEY." \n",
            'flag' => "\t".self::FLAG.'  ',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.lab_key', self::LAB_KEY)
            ->assertJsonPath('data.status', 'correct')
            ->assertJsonPath('data.correct', true);

        $this->assertDatabaseHas('submission_logs', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'was_correct' => true,
        ]);
    }

    public function test_request_with_accept_json_receives_laravel_validation_json(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this
            ->withHeaders(['Accept' => 'application/json'])
            ->post('/api/v1/labs/verify', [
                'lab_key' => self::LAB_KEY,
            ]);

        $response
            ->assertUnprocessable()
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonValidationErrors(['flag']);
    }

    public function test_boolean_values_return_validation_errors_without_type_errors(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/labs/verify', [
            'lab_key' => true,
            'flag' => false,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['lab_key', 'flag']);

        $this->assertSame(0, DB::table('submission_logs')->count());
    }
}
