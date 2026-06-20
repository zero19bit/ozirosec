<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\WriteupIngestionMethod;
use App\Enums\WriteupStatus;
use App\Enums\WriteupTranslationStatus;
use App\Models\LabWriteup;
use App\Models\Writeup;
use App\Models\WriteupSource;
use App\Models\WriteupTag;
use App\Models\WriteupTranslation;
use App\Models\WriteupVulnerability;
use App\Services\WriteupStatusTransitionPolicy;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use LogicException;
use Tests\TestCase;

final class WriteupDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_writeup_platform_tables_are_migrated(): void
    {
        foreach ([
            'writeup_sources',
            'writeups',
            'writeup_translations',
            'writeup_vulnerability',
            'lab_writeup',
            'writeup_tags',
            'writeup_tag',
            'writeup_automation_runs',
            'writeup_ingestion_attempts',
        ] as $table) {
            self::assertTrue(Schema::hasTable($table));
        }
    }

    public function test_url_and_enum_values_are_normalized_and_cast(): void
    {
        $writeup = Writeup::factory()->create([
            'canonical_url' => 'HTTPS://Example.TEST:443/research#fragment',
            'ingestion_method' => WriteupIngestionMethod::N8n,
            'status' => WriteupStatus::PendingReview,
        ]);

        self::assertSame('https://example.test/research', $writeup->canonical_url);
        self::assertSame(hash('sha256', 'https://example.test/research'), $writeup->canonical_url_hash);
        self::assertSame(WriteupIngestionMethod::N8n, $writeup->ingestion_method);
        self::assertSame(WriteupStatus::PendingReview, $writeup->status);
    }

    public function test_canonical_urls_are_unique_but_manual_items_may_omit_them(): void
    {
        Writeup::factory()->create(['canonical_url' => 'https://example.test/report']);

        $this->expectException(QueryException::class);
        Writeup::factory()->create(['canonical_url' => 'https://EXAMPLE.test:443/report']);
    }

    public function test_source_guid_is_unique_per_source(): void
    {
        $source = WriteupSource::factory()->create();
        Writeup::factory()->create(['source_id' => $source->id, 'source_guid' => 'entry-42']);

        $this->expectException(QueryException::class);
        Writeup::factory()->create(['source_id' => $source->id, 'source_guid' => 'entry-42']);
    }

    public function test_translation_locale_and_localized_slug_are_unique(): void
    {
        $writeup = Writeup::factory()->create();
        WriteupTranslation::factory()->create(['writeup_id' => $writeup->id, 'locale' => 'en', 'slug' => 'same-title']);

        $this->expectException(QueryException::class);
        WriteupTranslation::factory()->create(['writeup_id' => $writeup->id, 'locale' => 'en', 'slug' => 'other-title']);
    }

    public function test_writeup_relationships_preserve_external_vulnerability_and_lab_keys(): void
    {
        $writeup = Writeup::factory()->create();
        $vulnerability = WriteupVulnerability::query()->create([
            'writeup_id' => $writeup->id,
            'vulnerability_id' => 'ssrf',
            'is_primary' => true,
        ]);
        $lab = LabWriteup::query()->create([
            'writeup_id' => $writeup->id,
            'lab_key' => 'ssrf-001',
            'is_primary' => true,
        ]);
        $tag = WriteupTag::query()->create(['name' => 'SSRF', 'slug' => 'ssrf']);
        $writeup->tags()->attach($tag);

        self::assertTrue($writeup->vulnerabilityLinks->contains($vulnerability));
        self::assertTrue($writeup->labLinks->contains($lab));
        self::assertTrue($writeup->tags->contains($tag));
    }

    public function test_query_scopes_exclude_archived_and_future_publications(): void
    {
        $published = Writeup::factory()->published()->create();
        $future = Writeup::factory()->create(['status' => WriteupStatus::Published, 'published_at' => now()->addHour()]);
        $archived = Writeup::factory()->create(['status' => WriteupStatus::Archived, 'published_at' => now()->subHour()]);
        $scheduled = Writeup::factory()->create(['status' => WriteupStatus::Scheduled, 'scheduled_for' => now()->addHour()]);

        self::assertTrue(Writeup::query()->published()->pluck('id')->contains($published->id));
        self::assertFalse(Writeup::query()->published()->pluck('id')->contains($future->id));
        self::assertFalse(Writeup::query()->published()->pluck('id')->contains($archived->id));
        self::assertTrue(Writeup::query()->scheduled()->pluck('id')->contains($scheduled->id));
    }

    public function test_soft_deleted_writeups_are_hidden_from_default_queries(): void
    {
        $writeup = Writeup::factory()->create();
        $writeup->delete();

        self::assertNull(Writeup::query()->find($writeup->id));
        self::assertNotNull(Writeup::withTrashed()->find($writeup->id));
    }

    public function test_moderation_fields_cannot_be_mass_assigned(): void
    {
        $writeup = Writeup::query()->create([
            'original_title' => 'Safe manual draft',
            'status' => WriteupStatus::Published,
            'published_at' => now(),
            'internal_notes' => 'private',
        ]);

        $writeup->refresh();

        self::assertSame(WriteupStatus::Draft, $writeup->status);
        self::assertNull($writeup->published_at);
        self::assertNull($writeup->internal_notes);
    }

    public function test_transition_policy_rejects_invalid_publication_and_requires_bilingual_review(): void
    {
        $policy = app(WriteupStatusTransitionPolicy::class);
        $writeup = Writeup::factory()->create(['status' => WriteupStatus::Rejected]);

        $this->expectException(LogicException::class);
        $policy->transition($writeup, WriteupStatus::Published);
    }

    public function test_transition_policy_requires_schedule_date_and_publishes_only_ready_content(): void
    {
        $policy = app(WriteupStatusTransitionPolicy::class);
        $writeup = Writeup::factory()->create(['status' => WriteupStatus::Approved]);

        try {
            $policy->transition($writeup, WriteupStatus::Scheduled);
            self::fail('Expected scheduled_for validation to reject the transition.');
        } catch (LogicException) {
            // Expected.
        }

        WriteupTranslation::factory()->create([
            'writeup_id' => $writeup->id,
            'locale' => 'en',
            'slug' => 'ready-en',
            'translation_status' => WriteupTranslationStatus::Reviewed,
        ]);
        WriteupTranslation::factory()->create([
            'writeup_id' => $writeup->id,
            'locale' => 'fa',
            'slug' => 'ready-fa',
            'translation_status' => WriteupTranslationStatus::Published,
        ]);

        $policy->transition($writeup, WriteupStatus::Published);

        self::assertSame(WriteupStatus::Published, $writeup->status);
        self::assertNotNull($writeup->published_at);
    }
}
