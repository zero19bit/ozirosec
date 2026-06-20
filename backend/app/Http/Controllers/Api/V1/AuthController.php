<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProfileUpdateRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Support\Usernames;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $this->ensureStatefulSession($request);
        $this->normalizeEmail($request);
        $this->normalizeUsername($request);

        $validated = $request->validate([
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
            'name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'email' => ['required', 'string', 'lowercase', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = DB::transaction(static fn (): User => User::query()->forceCreate([
            'username' => $validated['username'],
            'name' => $validated['name'] ?? null,
            'email' => $validated['email'],
            'role' => UserRole::User->value,
            'password' => Hash::make($validated['password']),
        ]));

        $user->sendEmailVerificationNotification();

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful.',
            'data' => [
                'user' => UserResource::make($user),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $this->ensureStatefulSession($request);
        $this->normalizeEmail($request);

        $validated = $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email:rfc'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are invalid.'],
            ]);
        }

        if ($user->suspended_at !== null) {
            abort(403, 'This account is suspended.');
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => UserResource::make($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        Auth::forgetGuards();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful.',
            'data' => ['authenticated' => false],
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $userId = $user->getKey();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password is invalid.'],
            ]);
        }

        $this->ensureDatabaseSessionRevocationSupported();
        $sessionTable = (string) config('session.table', 'sessions');

        Auth::guard('web')->logout();
        Auth::forgetGuards();

        DB::transaction(static function () use ($userId, $sessionTable): void {
            User::query()
                ->whereKey($userId)
                ->update(['remember_token' => Str::random(60)]);

            DB::table($sessionTable)
                ->where('user_id', $userId)
                ->delete();
        });

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out from all devices.',
            'data' => ['authenticated' => false],
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => UserResource::make($request->user()),
            ],
        ]);
    }

    public function updateProfile(ProfileUpdateRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $data = $request->validated();

        $emailChanged = false;

        DB::transaction(static function () use ($user, $data, &$emailChanged): void {
            if (array_key_exists('name', $data)) {
                $user->name = $data['name'];
            }

            if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
                $user->email = $data['email'];
                $user->email_verified_at = null;
                $emailChanged = true;
            }

            $user->save();
        });

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'Profile updated.',
            'data' => [
                'user' => UserResource::make($user->fresh() ?? $user),
            ],
        ]);
    }

    private function ensureStatefulSession(Request $request): void
    {
        abort_if(! $request->hasSession(), 401, 'Stateful SPA session required.');
    }

    private function ensureDatabaseSessionRevocationSupported(): void
    {
        $sessionTable = (string) config('session.table', 'sessions');

        abort_if(
            config('session.driver') !== 'database'
                || ! Schema::hasTable($sessionTable)
                || ! Schema::hasColumn($sessionTable, 'user_id'),
            409,
            'All-device logout requires the database session driver with a sessions.user_id column.'
        );
    }

    private function normalizeEmail(Request $request): void
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
    }

    private function normalizeUsername(Request $request): void
    {
        if (is_string($request->input('username'))) {
            $request->merge(['username' => Usernames::canonicalize($request->input('username'))]);
        }
    }
}
