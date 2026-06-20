<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\Usernames;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class CreateAdminUser extends Command
{
    protected $signature = 'hackpath:create-admin
        {--username= : Unique administrator username}
        {--name= : Display name}
        {--email= : Email address}
        {--password= : Strong password; omit to be prompted securely}
        {--verify-email : Mark the administrator email as verified}';

    protected $description = 'Create the first HackPath administrator without insecure defaults.';

    public function handle(): int
    {
        $data = [
            'username' => $this->option('username') ?: $this->ask('Username'),
            'name' => $this->option('name') ?: $this->ask('Display name'),
            'email' => $this->option('email') ?: $this->ask('Email address'),
            'password' => $this->option('password') ?: $this->secret('Password'),
        ];

        if (is_string($data['username'])) {
            $data['username'] = Usernames::canonicalize($data['username']);
        }

        if (is_string($data['email'])) {
            $data['email'] = strtolower(trim($data['email']));
        }

        $validator = Validator::make($data, [
            'username' => [
                'required',
                'string',
                'min:'.Usernames::MIN_LENGTH,
                'max:'.Usernames::MAX_LENGTH,
                'regex:'.Usernames::PATTERN,
                'not_regex:/\.\./',
                Rule::notIn(Usernames::RESERVED),
                Rule::unique('users', 'username'),
            ],
            'name' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', Password::min(12)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $validated = $validator->validated();

        User::query()->forceCreate([
            'username' => $validated['username'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => UserRole::Admin->value,
            'email_verified_at' => $this->option('verify-email') ? now() : null,
            'password' => Hash::make($validated['password']),
        ]);

        $this->info('Administrator created successfully.');

        return self::SUCCESS;
    }
}
