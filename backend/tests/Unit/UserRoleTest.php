<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\UserRole;
use PHPUnit\Framework\TestCase;

final class UserRoleTest extends TestCase
{
    public function test_user_role_values_are_stable_for_database_and_api_serialization(): void
    {
        $this->assertSame('user', UserRole::User->value);
        $this->assertSame('admin', UserRole::Admin->value);
    }

    public function test_role_enum_rejects_unknown_values(): void
    {
        $this->assertNull(UserRole::tryFrom('superadmin'));
        $this->assertNull(UserRole::tryFrom(''));
    }
}
