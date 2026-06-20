<?php

declare(strict_types=1);

use App\Enums\WriteupTranslationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeup_translations', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('writeup_id')->constrained()->cascadeOnDelete();
            $table->string('locale', 12);
            $table->string('title', 500);
            $table->string('slug', 200);
            $table->text('short_summary');
            $table->json('key_findings')->nullable();
            $table->longText('technical_overview')->nullable();
            $table->longText('attack_explanation')->nullable();
            $table->longText('root_cause')->nullable();
            $table->longText('impact')->nullable();
            $table->longText('mitigation')->nullable();
            $table->longText('developer_lessons')->nullable();
            $table->longText('conclusion')->nullable();
            $table->string('translation_status', 32)->default(WriteupTranslationStatus::NeedsReview->value)->index();
            $table->boolean('is_ai_generated')->default(false);
            $table->string('ai_model', 160)->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['writeup_id', 'locale']);
            $table->unique(['locale', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeup_translations');
    }
};
