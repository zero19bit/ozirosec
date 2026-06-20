<?php

declare(strict_types=1);

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $needsRole = ! Schema::hasColumn('users', 'role');
        $needsSuspendedAt = ! Schema::hasColumn('users', 'suspended_at');

        if ($needsRole) {
            Schema::table('users', static function (Blueprint $table): void {
                $table->string('role', 32)->default(UserRole::User->value)->after('email')->index();
            });
        }

        if ($needsSuspendedAt) {
            Schema::table('users', static function (Blueprint $table): void {
                $table->timestamp('suspended_at')->nullable()->after('role')->index();
            });
        }
    }

    public function down(): void
    {
        // Intentionally non-destructive: this migration may be applied to
        // databases where role/suspension columns predate HackPath's migration
        // history. Rolling back must not drop pre-existing identity columns.
    }
};
