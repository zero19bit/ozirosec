<?php

declare(strict_types=1);

use App\Enums\WriteupSourceType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeup_sources', static function (Blueprint $table): void {
            $table->id();
            $table->string('name', 160);
            $table->string('slug', 160)->unique();
            $table->string('base_url', 2048);
            $table->string('feed_url', 2048)->nullable();
            $table->string('api_url', 2048)->nullable();
            $table->string('source_type', 24)->default(WriteupSourceType::Manual->value)->index();
            $table->string('original_language', 12)->default('en')->index();
            $table->boolean('is_enabled')->default(true)->index();
            $table->boolean('auto_publish')->default(false);
            $table->boolean('requires_review')->default(true);
            $table->unsignedInteger('fetch_interval_minutes')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamp('last_success_at')->nullable();
            $table->timestamp('last_error_at')->nullable();
            $table->string('last_error_message', 1000)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeup_sources');
    }
};
