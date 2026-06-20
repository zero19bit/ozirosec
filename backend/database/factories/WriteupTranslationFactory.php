<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\WriteupTranslationStatus;
use App\Models\Writeup;
use App\Models\WriteupTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WriteupTranslation> */
final class WriteupTranslationFactory extends Factory
{
    protected $model = WriteupTranslation::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(5);

        return [
            'writeup_id' => Writeup::factory(),
            'locale' => 'en',
            'title' => fake()->sentence(6),
            'slug' => $slug,
            'short_summary' => fake()->paragraph(),
            'key_findings' => [fake()->sentence()],
            'translation_status' => WriteupTranslationStatus::NeedsReview,
        ];
    }
}
