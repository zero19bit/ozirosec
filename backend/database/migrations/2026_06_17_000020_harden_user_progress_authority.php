<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_progress', static function (Blueprint $table): void {
            if (! Schema::hasColumn('user_progress', 'points_awarded')) {
                $table->unsignedInteger('points_awarded')->default(0)->after('attempt_count');
            }

            if (! Schema::hasColumn('user_progress', 'first_attempted_at')) {
                $table->timestamp('first_attempted_at')->nullable()->after('points_awarded');
            }
        });

        DB::table('user_progress')
            ->whereNull('first_attempted_at')
            ->whereNotNull('last_submitted_at')
            ->update(['first_attempted_at' => DB::raw('last_submitted_at')]);

        if (! $this->hasUniqueProgressIndex()) {
            Schema::table('user_progress', static function (Blueprint $table): void {
                $table->unique(['user_id', 'lab_key'], 'user_progress_user_id_lab_key_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::table('user_progress', static function (Blueprint $table): void {
            if (Schema::hasColumn('user_progress', 'first_attempted_at')) {
                $table->dropColumn('first_attempted_at');
            }

            if (Schema::hasColumn('user_progress', 'points_awarded')) {
                $table->dropColumn('points_awarded');
            }
        });
    }

    private function hasUniqueProgressIndex(): bool
    {
        return collect(Schema::getIndexes('user_progress'))
            ->contains(static function (array $index): bool {
                $columns = $index['columns'] ?? [];

                return ($index['unique'] ?? false) === true
                    && $columns === ['user_id', 'lab_key'];
            });
    }
};
