<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\Usernames;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class ResetToAdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = config('hackpath.auth.admin');

        if (is_array($admin) && is_string($admin['username'] ?? null)) {
            $admin['username'] = Usernames::canonicalize($admin['username']);
        }

        Validator::make($admin, [
            'username' => [
                'nullable',
                'string',
                'min:'.Usernames::MIN_LENGTH,
                'max:'.Usernames::MAX_LENGTH,
                'regex:'.Usernames::PATTERN,
                'not_regex:/\.\./',
                Rule::notIn(Usernames::RESERVED),
            ],
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
        ])->validate();

        DB::transaction(static function () use ($admin): void {
            $username = is_string($admin['username'] ?? null) && trim($admin['username']) !== ''
                ? Usernames::canonicalize($admin['username'])
                : Usernames::candidateFromDisplayName($admin['name'], 'admin');

            DB::table('personal_access_tokens')->delete();
            DB::table('submission_logs')->delete();
            DB::table('user_progress')->delete();
            DB::table('sessions')->delete();
            DB::table('password_reset_tokens')->delete();

            if (Schema::hasTable('cache')) {
                DB::table('cache')->delete();
            }

            User::query()->delete();

            User::query()->forceCreate([
                'username' => $username,
                'name' => $admin['name'],
                'email' => strtolower($admin['email']),
                'role' => UserRole::Admin->value,
                'email_verified_at' => now(),
                'password' => Hash::make($admin['password']),
            ]);
        });
    }
}
