<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use App\Models\User;
use App\Models\Writeup;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Writeup> */
final class WriteupFactory extends Factory
{
    protected $model = Writeup::class;

    public function definition(): array
    {
        return [
            'ingestion_method' => WriteupIngestionMethod::Manual,
            'original_title' => fake()->sentence(6),
            'original_language' => 'en',
            'status' => WriteupStatus::Draft,
            'created_by' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => WriteupStatus::Published,
            'published_at' => now()->subMinute(),
        ]);
    }
}
