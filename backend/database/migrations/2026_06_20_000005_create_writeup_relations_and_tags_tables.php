<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('writeup_vulnerability', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('writeup_id')->constrained()->cascadeOnDelete();
            $table->string('vulnerability_id', 120);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->unique(['writeup_id', 'vulnerability_id']);
            $table->index(['vulnerability_id', 'writeup_id']);
        });

        Schema::create('lab_writeup', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('writeup_id')->constrained()->cascadeOnDelete();
            $table->string('lab_key', 120);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->unique(['writeup_id', 'lab_key']);
            $table->index(['lab_key', 'writeup_id']);
        });

        Schema::create('writeup_tags', static function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 120)->unique();
            $table->timestamps();
        });

        Schema::create('writeup_tag', static function (Blueprint $table): void {
            $table->foreignId('writeup_id')->constrained()->cascadeOnDelete();
            $table->foreignId('writeup_tag_id')->constrained('writeup_tags')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['writeup_id', 'writeup_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('writeup_tag');
        Schema::dropIfExists('writeup_tags');
        Schema::dropIfExists('lab_writeup');
        Schema::dropIfExists('writeup_vulnerability');
    }
};
