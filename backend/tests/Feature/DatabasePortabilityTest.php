<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class DatabasePortabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_progress_has_one_record_per_user_lab_constraint(): void
    {
        $this->assertTrue($this->hasUniqueIndex('user_progress', ['user_id', 'lab_key']));
    }

    public function test_production_query_indexes_exist(): void
    {
        $this->assertTrue($this->hasIndex('users', 'users_role_suspended_at_index'));
        $this->assertTrue($this->hasIndex('user_progress', 'user_progress_status_completed_at_index'));
        $this->assertTrue($this->hasIndex('user_progress', 'user_progress_user_lab_status_index'));
        $this->assertTrue($this->hasIndex('submission_logs', 'submission_logs_was_correct_created_at_index'));
    }

    public function test_foreign_key_columns_match_unsigned_big_integer_ids(): void
    {
        $userIdType = Schema::getColumnType('users', 'id');

        $this->assertContains($userIdType, ['bigint', 'integer']);
        $this->assertSame($userIdType, Schema::getColumnType('user_progress', 'user_id'));
        $this->assertSame($userIdType, Schema::getColumnType('submission_logs', 'user_id'));
        $this->assertSame($userIdType, Schema::getColumnType('sessions', 'user_id'));
    }

    private function hasIndex(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(static fn (array $index): bool => ($index['name'] ?? null) === $name);
    }

    /**
     * @param  list<string>  $columns
     */
    private function hasUniqueIndex(string $table, array $columns): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(static fn (array $index): bool => ($index['unique'] ?? false) === true
                && ($index['columns'] ?? []) === $columns);
    }
}
