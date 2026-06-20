<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class UserRoleSuspensionMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_corrective_migration_adds_columns_to_original_users_table_shape(): void
    {
        $this->removeRoleAndSuspensionColumns();

        $this->correctiveMigration()->up();

        $this->assertTrue(Schema::hasColumn('users', 'role'));
        $this->assertTrue(Schema::hasColumn('users', 'suspended_at'));
        $this->assertSame(UserRole::User->value, $this->columnDefault('users', 'role'));
    }

    public function test_corrective_migration_is_idempotent_when_columns_already_exist(): void
    {
        $this->correctiveMigration()->up();
        $this->correctiveMigration()->up();

        $columns = Schema::getColumnListing('users');

        $this->assertSame(1, count(array_keys($columns, 'role', true)));
        $this->assertSame(1, count(array_keys($columns, 'suspended_at', true)));
    }

    public function test_corrective_migration_down_does_not_drop_existing_columns(): void
    {
        $this->correctiveMigration()->down();

        $this->assertTrue(Schema::hasColumn('users', 'role'));
        $this->assertTrue(Schema::hasColumn('users', 'suspended_at'));
    }

    public function test_legacy_misnamed_migration_down_is_non_destructive(): void
    {
        $this->legacyMigration()->down();

        $this->assertTrue(Schema::hasColumn('users', 'role'));
        $this->assertTrue(Schema::hasColumn('users', 'suspended_at'));
    }

    public function test_migration_status_contains_legacy_and_corrective_migrations(): void
    {
        $ranMigrations = DB::table('migrations')->pluck('migration')->all();

        $this->assertContains('2026_06_15_000001_create_users_table', $ranMigrations);
        $this->assertContains('2026_06_18_000005_ensure_user_role_and_suspension_columns', $ranMigrations);
    }

    private function removeRoleAndSuspensionColumns(): void
    {
        foreach ([
            'users_role_suspended_at_index',
            'users_role_index',
            'users_suspended_at_index',
        ] as $index) {
            if ($this->hasIndex('users', $index)) {
                Schema::table('users', static function ($table) use ($index): void {
                    $table->dropIndex($index);
                });
            }
        }

        if (Schema::hasColumn('users', 'suspended_at')) {
            Schema::table('users', static function ($table): void {
                $table->dropColumn('suspended_at');
            });
        }

        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', static function ($table): void {
                $table->dropColumn('role');
            });
        }
    }

    private function correctiveMigration(): object
    {
        return require database_path('migrations/2026_06_18_000005_ensure_user_role_and_suspension_columns.php');
    }

    private function legacyMigration(): object
    {
        return require database_path('migrations/2026_06_15_000001_create_users_table.php');
    }

    private function columnDefault(string $table, string $column): mixed
    {
        $default = collect(Schema::getColumns($table))
            ->firstWhere('name', $column)['default'] ?? null;

        return is_string($default) ? trim($default, "'") : $default;
    }

    private function hasIndex(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(static fn (array $index): bool => ($index['name'] ?? null) === $name);
    }
}
