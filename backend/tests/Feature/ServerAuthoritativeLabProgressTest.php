<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

final class ServerAuthoritativeLabProgressTest extends TestCase
{
    use RefreshDatabase;

    private const LAB_KEY = 'authority-lab';

    private const INACTIVE_LAB_KEY = 'inactive-lab';

    private const FLAG = 'server-authoritative-flag';

    private const SECRET = 'authoritative-test-secret';

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('vulnerabilities.flag_secret', self::SECRET);
        Config::set('vulnerabilities.digest_algorithm', 'sha256');
        Config::set('vulnerabilities.labs', [
            self::LAB_KEY => [
                'key' => self::LAB_KEY,
                'title' => 'Authority Lab',
                'vulnerability' => 'Trust Boundary',
                'difficulty' => 'Apprentice',
                'active' => true,
                'points' => 40,
                'expected_digest' => hash_hmac('sha256', self::FLAG, self::SECRET),
            ],
            self::INACTIVE_LAB_KEY => [
                'key' => self::INACTIVE_LAB_KEY,
                'title' => 'Inactive Lab',
                'vulnerability' => 'Trust Boundary',
                'difficulty' => 'Apprentice',
                'active' => false,
                'points' => 500,
                'expected_digest' => hash_hmac('sha256', self::FLAG, self::SECRET),
            ],
        ]);
    }

    public function test_correct_flag_records_completion_and_points_from_backend(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk()
            ->assertJsonPath('data.correct', true)
            ->assertJsonPath('data.points_awarded', 40)
            ->assertJsonPath('data.progress.attempt_count', 1)
            ->assertJsonPath('data.progress.points_awarded_total', 40);

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'status' => 'completed',
            'attempt_count' => 1,
            'points_awarded' => 40,
        ]);
    }

    public function test_incorrect_flag_records_failed_attempt_without_points(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => 'wrong'])
            ->assertOk()
            ->assertJsonPath('data.correct', false)
            ->assertJsonPath('data.points_awarded', 0)
            ->assertJsonPath('data.progress.attempt_count', 1);

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'status' => 'started',
            'attempt_count' => 1,
            'points_awarded' => 0,
        ]);
    }

    public function test_unknown_lab_returns_safe_status_without_progress(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => 'missing-lab', 'flag' => self::FLAG])
            ->assertOk()
            ->assertJsonPath('data.status', 'unknown_lab')
            ->assertJsonMissingPath('data.progress');

        $this->assertSame(0, DB::table('user_progress')->count());
        $this->assertSame(1, DB::table('submission_logs')->count());
    }

    public function test_inactive_lab_returns_safe_status_without_progress(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::INACTIVE_LAB_KEY, 'flag' => self::FLAG])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive')
            ->assertJsonPath('data.points_awarded', 0)
            ->assertJsonMissingPath('data.progress');

        $this->assertSame(0, DB::table('user_progress')->count());
        $this->assertSame(1, DB::table('submission_logs')->count());
    }

    public function test_forged_points_user_and_completion_state_are_ignored(): void
    {
        $realUser = User::factory()->create();
        $otherUser = User::factory()->create();

        $this->actingAs($realUser, 'web')
            ->postJson('/api/v1/labs/verify', [
                'lab_key' => self::LAB_KEY,
                'flag' => self::FLAG,
                'points' => 999999,
                'user_id' => $otherUser->getKey(),
                'completed' => false,
                'correct' => false,
                'attempt_count' => 999,
                'active' => false,
                'role' => 'admin',
            ])
            ->assertOk()
            ->assertJsonPath('data.points_awarded', 40);

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $realUser->getKey(),
            'lab_key' => self::LAB_KEY,
            'points_awarded' => 40,
            'attempt_count' => 1,
            'status' => 'completed',
        ]);
        $this->assertDatabaseMissing('user_progress', ['user_id' => $otherUser->getKey()]);
    }

    public function test_repeated_correct_submission_awards_points_once(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertJsonPath('data.points_awarded', 40);

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertJsonPath('data.points_awarded', 0)
            ->assertJsonPath('data.progress.attempt_count', 2)
            ->assertJsonPath('data.progress.points_awarded_total', 40);

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'attempt_count' => 2,
            'points_awarded' => 40,
        ]);
    }

    public function test_repeated_failed_attempts_increment_consistently(): void
    {
        $user = User::factory()->create();

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $this->actingAs($user, 'web')
                ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => 'wrong-'.$attempt])
                ->assertJsonPath('data.progress.attempt_count', $attempt);
        }

        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'attempt_count' => 3,
            'points_awarded' => 0,
        ]);
        $this->assertSame(3, DB::table('submission_logs')->count());
    }

    public function test_concurrent_style_correct_submissions_award_once(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk();
        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk();

        $this->assertSame(1, DB::table('user_progress')->where('user_id', $user->getKey())->where('lab_key', self::LAB_KEY)->count());
        $this->assertDatabaseHas('user_progress', [
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'points_awarded' => 40,
            'attempt_count' => 2,
        ]);
    }

    public function test_suspended_user_rejected(): void
    {
        $user = User::factory()->create(['suspended_at' => now()]);

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertForbidden();
    }

    public function test_unauthenticated_user_rejected(): void
    {
        $this->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertUnauthorized();
    }

    public function test_unverified_user_rejected_when_verification_required(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertForbidden();
    }

    public function test_direct_api_submission_without_frontend_succeeds(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->withHeader('Accept', 'application/json')
            ->post('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk()
            ->assertJsonPath('data.correct', true);
    }

    public function test_no_plaintext_submitted_flag_is_persisted(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk();

        $payload = json_encode(DB::table('submission_logs')->first(), JSON_THROW_ON_ERROR);
        $this->assertStringNotContainsString(self::FLAG, $payload);
    }

    public function test_database_constraint_prevents_duplicate_progress_rows(): void
    {
        $user = User::factory()->create();

        DB::table('user_progress')->insert([
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'status' => 'started',
            'attempt_count' => 0,
            'points_awarded' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        DB::table('user_progress')->insert([
            'user_id' => $user->getKey(),
            'lab_key' => self::LAB_KEY,
            'status' => 'started',
            'attempt_count' => 0,
            'points_awarded' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_progress_endpoint_returns_server_authoritative_snapshot(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->postJson('/api/v1/labs/verify', ['lab_key' => self::LAB_KEY, 'flag' => self::FLAG])
            ->assertOk();

        $this->actingAs($user, 'web')
            ->getJson('/api/v1/progress')
            ->assertOk()
            ->assertJsonPath('data.completed_labs.0', self::LAB_KEY)
            ->assertJsonPath('data.total_xp', 40)
            ->assertJsonPath('data.progress.0.attempt_count', 1);
    }
}
