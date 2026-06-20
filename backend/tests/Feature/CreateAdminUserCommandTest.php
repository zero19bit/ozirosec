<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class CreateAdminUserCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_admin_command_requires_secure_password(): void
    {
        $this->artisan('hackpath:create-admin', [
            '--username' => 'security-admin',
            '--name' => 'Security Admin',
            '--email' => 'admin@example.test',
            '--password' => 'password',
        ])->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'admin@example.test']);
    }

    public function test_create_admin_command_creates_verified_admin_when_requested(): void
    {
        $this->artisan('hackpath:create-admin', [
            '--username' => 'Security.Admin',
            '--name' => 'Security Admin',
            '--email' => 'Admin@Example.test',
            '--password' => 'VeryStrongPassword!42',
            '--verify-email' => true,
        ])->assertSuccessful();

        $admin = User::query()->where('email', 'admin@example.test')->firstOrFail();

        $this->assertSame('security.admin', $admin->username);
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue(Hash::check('VeryStrongPassword!42', $admin->password));
        $this->assertNotNull($admin->email_verified_at);
    }
}
