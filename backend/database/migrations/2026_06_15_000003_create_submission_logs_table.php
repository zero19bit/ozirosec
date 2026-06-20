<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_logs', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('lab_key', 120);
            $table->char('submitted_digest', 64);
            $table->boolean('was_correct')->default(false);
            $table->char('ip_digest', 64)->nullable();
            $table->char('user_agent_digest', 64)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'lab_key', 'created_at']);
            $table->index(['lab_key', 'was_correct', 'created_at']);
            $table->index(['created_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_logs');
    }
};
