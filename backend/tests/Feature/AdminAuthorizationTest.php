<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

final class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_denied_from_every_admin_endpoint(): void
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($user, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/metrics')->assertForbidden();
        $this->actingAs($user, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/users')->assertForbidden();
        $this->actingAs($user, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/logs')->assertForbidden();
        $this->actingAs($user, 'web')->withStatefulHeaders()->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::Admin->value])->assertForbidden();
    }

    public function test_administrator_allowed(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create();

        $this->actingAs($admin, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/metrics')->assertOk();
        $this->actingAs($admin, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/users')->assertOk();
        $this->actingAs($admin, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/logs')->assertOk();
        $this->actingAs($admin, 'web')->withStatefulHeaders()->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::Admin->value])->assertOk();
    }

    public function test_suspended_administrator_denied(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'suspended_at' => now(),
        ]);

        $this->actingAs($admin, 'web')->withStatefulHeaders()->getJson('/api/v1/admin/metrics')
            ->assertForbidden()
            ->assertJsonPath('message', 'This account is suspended.');
    }

    public function test_unauthenticated_user_denied(): void
    {
        $this->withStatefulHeaders()->getJson('/api/v1/admin/metrics')->assertUnauthorized();
    }

    public function test_forged_role_during_registration_is_ignored(): void
    {
        $this->statefulPost('/api/v1/register', [
            'username' => 'forgedrole',
            'email' => 'forged@example.test',
            'password' => 'StrongPass!42',
            'role' => UserRole::Admin->value,
        ])
            ->assertCreated()
            ->assertJsonPath('data.user.role', UserRole::User->value);

        $this->assertDatabaseHas('users', [
            'email' => 'forged@example.test',
            'role' => UserRole::User->value,
        ]);
    }

    public function test_forged_role_during_profile_update_is_ignored(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->withStatefulHeaders()
            ->patchJson('/api/v1/user', [
                'name' => 'updatedname',
                'role' => UserRole::Admin->value,
            ])
            ->assertOk()
            ->assertJsonPath('data.user.role', UserRole::User->value);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'updatedname',
            'role' => UserRole::User->value,
        ]);
    }

    public function test_self_demotion_protection(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => UserRole::User->value])
            ->assertForbidden();
    }

    public function test_final_admin_demotion_protection(): void
    {
        $actor = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($actor, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::User->value])
            ->assertOk();

        $this->actingAs($actor, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$actor->id}", ['role' => UserRole::User->value])
            ->assertForbidden();

        $this->assertGreaterThanOrEqual(1, User::query()->where('role', UserRole::Admin->value)->whereNull('suspended_at')->count());
    }

    public function test_final_admin_suspension_protection(): void
    {
        $actor = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($actor, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['suspended' => true])
            ->assertOk();

        $this->actingAs($actor, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$actor->id}", ['suspended' => true])
            ->assertForbidden();

        $this->assertGreaterThanOrEqual(1, User::query()->where('role', UserRole::Admin->value)->whereNull('suspended_at')->count());
    }

    public function test_final_admin_transaction_guard_rejects_direct_final_admin_removal(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create(['role' => UserRole::Admin]);

        $target->update(['suspended_at' => now()]);

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => UserRole::User->value])
            ->assertOk();

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => UserRole::User->value])
            ->assertForbidden();

        $this->assertGreaterThanOrEqual(1, User::query()->where('role', UserRole::Admin->value)->whereNull('suspended_at')->count());
    }

    public function test_invalid_role_rejected(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create();

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['role' => 'superadmin'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }

    public function test_concurrent_final_admin_changes_do_not_remove_all_administrators(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $target = User::factory()->create(['role' => UserRole::Admin]);

        $this->actingAs($admin, 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$target->id}", ['suspended' => true])
            ->assertOk();

        $this->actingAs($target->fresh(), 'web')
            ->withStatefulHeaders()
            ->patchJson("/api/v1/admin/users/{$admin->id}", ['role' => UserRole::User->value])
            ->assertForbidden();

        $this->assertGreaterThanOrEqual(1, User::query()->where('role', UserRole::Admin->value)->whereNull('suspended_at')->count());
    }

    public function test_enum_casting(): void
    {
        $user = User::factory()->create(['role' => UserRole::Admin]);

        $this->assertSame(UserRole::Admin, $user->refresh()->role);
    }

    private function statefulPost(string $uri, array $payload): TestResponse
    {
        return $this->withStatefulHeaders()->postJson($uri, $payload);
    }

    private function withStatefulHeaders(): self
    {
        return $this
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withHeader('Accept', 'application/json');
    }
}
