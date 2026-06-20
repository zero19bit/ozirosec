<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class UsernameSemanticsTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    public function test_valid_username(): void
    {
        $this->register(['username' => 'valid.user-1'])
            ->assertCreated()
            ->assertJsonPath('data.user.username', 'valid.user-1');

        $this->assertDatabaseHas('users', [
            'username' => 'valid.user-1',
            'name' => null,
        ]);
    }

    public function test_duplicate_exact_username_rejected(): void
    {
        User::factory()->create(['username' => 'duplicate']);

        $this->register(['username' => 'duplicate'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_duplicate_mixed_case_username_rejected(): void
    {
        User::factory()->create(['username' => 'mixedcase']);

        $this->register(['username' => 'MixedCase'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_invalid_characters_rejected(): void
    {
        $this->register(['username' => 'bad/name'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_unicode_lookalike_rejected(): void
    {
        $this->register(['username' => 'аdmin1'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_reserved_username_rejected(): void
    {
        $this->register(['username' => 'admin'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_too_short_username_rejected(): void
    {
        $this->register(['username' => 'ab'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_too_long_username_rejected(): void
    {
        $this->register(['username' => str_repeat('a', 33)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);
    }

    public function test_whitespace_and_case_normalization(): void
    {
        $this->register(['username' => '  Case.Name-1  '])
            ->assertCreated()
            ->assertJsonPath('data.user.username', 'case.name-1');

        $this->assertDatabaseHas('users', ['username' => 'case.name-1']);
    }

    public function test_api_serialization_keeps_username_and_display_name_separate(): void
    {
        $user = User::factory()->create([
            'username' => 'public-id',
            'name' => 'Readable Display',
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->getJson('/api/v1/user')
            ->assertOk()
            ->assertJsonPath('data.user.username', 'public-id')
            ->assertJsonPath('data.user.name', 'Readable Display');
    }

    public function test_display_name_remains_separate_from_username(): void
    {
        $this->register([
            'username' => 'separate-id',
            'name' => 'Separate Display',
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.username', 'separate-id')
            ->assertJsonPath('data.user.name', 'Separate Display');

        $this->assertDatabaseHas('users', [
            'username' => 'separate-id',
            'name' => 'Separate Display',
        ]);
    }

    public function test_profile_update_does_not_change_username(): void
    {
        $user = User::factory()->create([
            'username' => 'stable-id',
            'name' => 'Old Display',
        ]);

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->patchJson('/api/v1/user', [
                'username' => 'new-id',
                'name' => 'New Display',
            ])
            ->assertOk()
            ->assertJsonPath('data.user.username', 'stable-id')
            ->assertJsonPath('data.user.name', 'New Display');

        $this->assertDatabaseHas('users', [
            'id' => $user->getKey(),
            'username' => 'stable-id',
            'name' => 'New Display',
        ]);
    }

    public function test_migration_backfill_from_legacy_name(): void
    {
        $this->recreateLegacyUsersTable();

        User::query()->forceCreate([
            'name' => 'Legacy User',
            'email' => 'legacy@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $migration = require database_path('migrations/2026_06_17_000010_add_username_to_users_table.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'legacy@example.test',
            'username' => 'legacy-user',
            'name' => 'Legacy User',
        ]);
    }

    public function test_collision_backfill_appends_stable_suffix(): void
    {
        $this->recreateLegacyUsersTable();

        User::query()->forceCreate([
            'name' => 'Collision User',
            'email' => 'first@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);
        $second = User::query()->forceCreate([
            'name' => 'Collision User',
            'email' => 'second@example.test',
            'password' => Hash::make('StrongPass!42'),
        ]);

        $migration = require database_path('migrations/2026_06_17_000010_add_username_to_users_table.php');
        $migration->up();

        $this->assertDatabaseHas('users', [
            'email' => 'first@example.test',
            'username' => 'collision-user',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'second@example.test',
            'username' => 'collision-user-'.$second->getKey(),
        ]);
    }

    private function register(array $overrides = []): TestResponse
    {
        return $this->withStatefulHeaders()->postJson('/api/v1/register', array_merge([
            'username' => 'validuser',
            'email' => fake()->unique()->safeEmail(),
            'password' => 'StrongPass!42',
        ], $overrides));
    }

    private function withStatefulHeaders(): self
    {
        return $this
            ->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->withHeader('Referer', self::FRONTEND_ORIGIN.'/')
            ->withHeader('Accept', 'application/json');
    }

    private function recreateLegacyUsersTable(): void
    {
        Schema::dropIfExists('users');

        Schema::create('users', static function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('role', 32)->default('user')->index();
            $table->timestamp('suspended_at')->nullable()->index();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }
}
