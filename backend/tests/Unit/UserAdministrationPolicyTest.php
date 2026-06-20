<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use App\Policies\UserAdministrationPolicy;
use Tests\TestCase;

final class UserAdministrationPolicyTest extends TestCase
{
    private UserAdministrationPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new UserAdministrationPolicy;
    }

    public function test_active_admin_can_view_administrative_surfaces(): void
    {
        $admin = $this->user(role: UserRole::Admin);

        $this->assertTrue($this->policy->viewAny($admin));
        $this->assertTrue($this->policy->viewMetrics($admin));
        $this->assertTrue($this->policy->viewLogs($admin));
    }

    public function test_regular_or_suspended_users_are_denied(): void
    {
        $this->assertFalse($this->policy->viewAny($this->user(role: UserRole::User)));
        $this->assertFalse($this->policy->viewAny($this->user(role: UserRole::Admin, suspended: true)));
    }

    public function test_admin_cannot_update_self_through_policy(): void
    {
        $admin = $this->user(id: 10, role: UserRole::Admin);

        $this->assertFalse($this->policy->update($admin, $admin));
        $this->assertTrue($this->policy->update($admin, $this->user(id: 11, role: UserRole::User)));
    }

    private function user(?int $id = null, UserRole $role = UserRole::User, bool $suspended = false): User
    {
        $user = new User([
            'username' => 'user'.($id ?? random_int(100, 999)),
            'name' => 'Policy User',
            'email' => 'policy'.($id ?? random_int(1000, 9999)).'@example.test',
            'password' => 'irrelevant',
        ]);

        if ($id !== null) {
            $user->id = $id;
            $user->exists = true;
        }

        $user->role = $role;
        $user->suspended_at = $suspended ? now() : null;

        return $user;
    }
}
