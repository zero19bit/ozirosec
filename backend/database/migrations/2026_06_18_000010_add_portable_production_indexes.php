<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $this->indexIfMissing($table, 'users_role_suspended_at_index', ['role', 'suspended_at']);
        });

        Schema::table('user_progress', function (Blueprint $table): void {
            $this->indexIfMissing($table, 'user_progress_status_completed_at_index', ['status', 'completed_at']);
            $this->indexIfMissing($table, 'user_progress_user_lab_status_index', ['user_id', 'lab_key', 'status']);
        });

        Schema::table('submission_logs', function (Blueprint $table): void {
            $this->indexIfMissing($table, 'submission_logs_was_correct_created_at_index', ['was_correct', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('submission_logs', function (Blueprint $table): void {
            $this->dropIndexIfPresent($table, 'submission_logs_was_correct_created_at_index');
        });

        Schema::table('user_progress', function (Blueprint $table): void {
            $this->dropIndexIfPresent($table, 'user_progress_user_lab_status_index');
            $this->dropIndexIfPresent($table, 'user_progress_status_completed_at_index');
        });

        Schema::table('users', function (Blueprint $table): void {
            $this->dropIndexIfPresent($table, 'users_role_suspended_at_index');
        });
    }

    /**
     * @param  list<string>  $columns
     */
    private function indexIfMissing(Blueprint $table, string $name, array $columns): void
    {
        if (! $this->hasIndex($table->getTable(), $name)) {
            $table->index($columns, $name);
        }
    }

    private function dropIndexIfPresent(Blueprint $table, string $name): void
    {
        if ($this->hasIndex($table->getTable(), $name)) {
            $table->dropIndex($name);
        }
    }

    private function hasIndex(string $table, string $name): bool
    {
        return collect(Schema::getIndexes($table))
            ->contains(static fn (array $index): bool => ($index['name'] ?? null) === $name);
    }
};
