<?php

declare(strict_types=1);

use App\Support\Usernames;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', static function (Blueprint $table): void {
                $table->string('username', Usernames::MAX_LENGTH)->nullable()->after('id');
            });
        }

        $this->backfillUsernames();

        if (! $this->hasIndex('users', 'users_username_unique')) {
            Schema::table('users', static function (Blueprint $table): void {
                $table->unique('username', 'users_username_unique');
            });
        }

        $this->makeUsernameRequiredWhenSupported();
        $this->makeDisplayNameNullableWhenSupported();
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'username')) {
            Schema::table('users', static function (Blueprint $table): void {
                $table->dropUnique('users_username_unique');
                $table->dropColumn('username');
            });
        }
    }

    private function backfillUsernames(): void
    {
        $used = [];

        DB::table('users')
            ->select(['id', 'name', 'username'])
            ->orderBy('id')
            ->get()
            ->each(function (object $user) use (&$used): void {
                if (is_string($user->username) && $user->username !== '') {
                    $used[$user->username] = true;

                    return;
                }

                $candidate = Usernames::candidateFromDisplayName($user->name, $user->id);
                $username = $candidate;

                if (isset($used[$username]) || DB::table('users')->where('username', $username)->exists()) {
                    $username = Usernames::withStableSuffix($candidate, $user->id);
                }

                $used[$username] = true;

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['username' => $username]);
            });
    }

    private function makeUsernameRequiredWhenSupported(): void
    {
        Schema::table('users', static function (Blueprint $table): void {
            $table->string('username', Usernames::MAX_LENGTH)->nullable(false)->change();
        });
    }

    private function makeDisplayNameNullableWhenSupported(): void
    {
        Schema::table('users', static function (Blueprint $table): void {
            $table->string('name')->nullable()->change();
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(static fn (array $existing): bool => ($existing['name'] ?? null) === $index);
    }
};
