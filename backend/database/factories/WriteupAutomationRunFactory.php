<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\WriteupAutomationRun;
use App\Models\WriteupSource;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<WriteupAutomationRun> */
final class WriteupAutomationRunFactory extends Factory
{
    protected $model = WriteupAutomationRun::class;

    public function definition(): array
    {
        return [
            'source_id' => WriteupSource::factory(),
            'run_uuid' => (string) Str::uuid(),
            'provider' => 'n8n',
            'external_run_id' => fake()->unique()->uuid(),
            'status' => 'completed',
            'started_at' => now()->subMinute(),
            'completed_at' => now(),
        ];
    }
}
