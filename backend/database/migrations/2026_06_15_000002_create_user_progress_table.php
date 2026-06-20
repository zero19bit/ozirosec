<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_progress', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('lab_key', 120);
            $table->string('status', 32)->default('started');
            $table->unsignedInteger('attempt_count')->default(0);
            $table->unsignedInteger('points_awarded')->default(0);
            $table->timestamp('first_attempted_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('last_submitted_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['user_id', 'lab_key']);
            $table->index(['lab_key', 'status']);
            $table->index(['user_id', 'status', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};
