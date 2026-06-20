<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeup_automation_runs', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_id')->nullable()->constrained('writeup_sources')->nullOnDelete();
            $table->uuid('run_uuid')->unique();
            $table->string('provider', 80);
            $table->string('external_run_id', 191)->nullable();
            $table->string('status', 32)->default('running')->index();
            $table->timestamp('started_at')->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->unsignedInteger('sources_checked')->default(0);
            $table->unsignedInteger('items_discovered')->default(0);
            $table->unsignedInteger('items_imported')->default(0);
            $table->unsignedInteger('duplicates_skipped')->default(0);
            $table->unsignedInteger('items_rejected')->default(0);
            $table->unsignedInteger('translation_failures')->default(0);
            $table->string('error_summary', 1000)->nullable();
            $table->timestamps();
            $table->unique(['provider', 'external_run_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeup_automation_runs');
    }
};
