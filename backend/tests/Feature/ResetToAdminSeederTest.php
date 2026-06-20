<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ResetToAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

final class ResetToAdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_creation_fails_without_explicit_secure_password(): void
    {
        Config::set('hackpath.auth.admin', [
            'name' => 'Security Administrator',
            'email' => 'security-admin@example.invalid',
            'password' => null,
        ]);

        $this->expectException(ValidationException::class);

        $this->seed(ResetToAdminSeeder::class);
    }

    public function test_admin_creation_requires_explicit_secure_credentials(): void
    {
        $adminSecret = 'ExplicitSeederSecret!82';

        Config::set('hackpath.auth.admin', [
            'name' => 'Security Administrator',
            'email' => 'security-admin@example.invalid',
            'password' => $adminSecret,
        ]);

        $this->seed(ResetToAdminSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'security-admin@example.invalid',
            'role' => 'admin',
        ]);

        $user = User::query()->where('email', 'security-admin@example.invalid')->firstOrFail();

        $this->assertTrue(Hash::check($adminSecret, $user->password));
    }
}
