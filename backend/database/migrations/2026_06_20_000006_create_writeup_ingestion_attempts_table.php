<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeup_ingestion_attempts', static function (Blueprint $table): void {
            $table->id();
            $table->uuid('request_id')->unique();
            $table->foreignId('source_id')->nullable()->constrained('writeup_sources')->nullOnDelete();
            $table->foreignId('writeup_id')->nullable()->constrained()->nullOnDelete();
            $table->string('canonical_url', 2048)->nullable();
            $table->char('canonical_url_hash', 64)->nullable()->index();
            $table->string('outcome', 40)->index();
            $table->string('duplicate_reason', 80)->nullable();
            $table->string('validation_failure_summary', 1000)->nullable();
            $table->timestamps();
            $table->index(['source_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeup_ingestion_attempts');
    }
};
