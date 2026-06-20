<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\WriteupSourceType;
use App\Models\WriteupSource;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WriteupSource> */
final class WriteupSourceFactory extends Factory
{
    protected $model = WriteupSource::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);

        return [
            'name' => fake()->company(),
            'slug' => $slug,
            'base_url' => 'https://'.$slug.'.example.test',
            'source_type' => WriteupSourceType::Rss,
            'original_language' => 'en',
            'is_enabled' => true,
            'auto_publish' => false,
            'requires_review' => true,
            'fetch_interval_minutes' => 60,
        ];
    }
}
