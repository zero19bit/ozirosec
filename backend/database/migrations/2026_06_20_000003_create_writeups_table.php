<?php

declare(strict_types=1);

use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeups', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_id')->nullable()->constrained('writeup_sources')->nullOnDelete();
            $table->string('ingestion_method', 24)->default(WriteupIngestionMethod::Manual->value)->index();
            $table->string('original_title', 500);
            $table->string('canonical_url', 2048)->nullable();
            $table->char('canonical_url_hash', 64)->nullable()->unique();
            $table->string('source_guid', 500)->nullable();
            $table->char('source_guid_hash', 64)->nullable();
            $table->string('original_author', 255)->nullable();
            $table->string('original_language', 12)->default('en')->index();
            $table->timestamp('original_published_at')->nullable()->index();
            $table->string('difficulty', 32)->nullable()->index();
            $table->string('writeup_type', 80)->nullable()->index();
            $table->unsignedSmallInteger('reading_time_minutes')->nullable();
            $table->string('featured_image_url', 2048)->nullable();
            $table->char('content_hash', 64)->nullable()->index();
            $table->string('status', 32)->default(WriteupStatus::Draft->value)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('scheduled_for')->nullable()->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('automation_run_id')->nullable()->constrained('writeup_automation_runs')->nullOnDelete();
            $table->boolean('ai_generated')->default(false);
            $table->string('ai_provider', 100)->nullable();
            $table->string('ai_model', 160)->nullable();
            $table->decimal('ai_confidence', 5, 4)->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['source_id', 'source_guid_hash']);
            $table->index(['status', 'published_at']);
            $table->index(['source_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeups');
    }
};
