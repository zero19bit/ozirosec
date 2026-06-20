<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\WriteupStatus;
use App\Enums\WriteupTranslationStatus;
use App\Models\Writeup;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * Valid graph:
 * draft -> pending_review, archived
 * pending_review -> needs_revision, approved, rejected, archived
 * needs_revision -> draft, pending_review, archived
 * approved -> scheduled, published, needs_revision, archived
 * scheduled -> published, approved, archived
 * published -> archived
 * rejected -> draft, archived
 * archived -> draft
 */
final class WriteupStatusTransitionPolicy
{
    /** @var list<string> */
    private const REQUIRED_PUBLICATION_LOCALES = ['en', 'fa'];

    public function assertCanTransition(Writeup $writeup, WriteupStatus $target, ?Carbon $at = null): void
    {
        if (! in_array($target, $this->allowedTargets($writeup->status), true)) {
            throw new LogicException(sprintf('Cannot transition a write-up from %s to %s.', $writeup->status->value, $target->value));
        }

        if ($target === WriteupStatus::Scheduled && $writeup->scheduled_for === null) {
            throw new LogicException('A scheduled write-up requires a scheduled_for timestamp.');
        }

        if ($target === WriteupStatus::Published) {
            $this->assertPublicationReady($writeup);
        }
    }

    public function transition(Writeup $writeup, WriteupStatus $target, ?Carbon $at = null): Writeup
    {
        $this->assertCanTransition($writeup, $target, $at);
        $writeup->status = $target;

        if ($target === WriteupStatus::Published) {
            $writeup->published_at = $at ?? now();
        }

        return $writeup;
    }

    /** @return list<WriteupStatus> */
    private function allowedTargets(WriteupStatus $status): array
    {
        return match ($status) {
            WriteupStatus::Draft => [WriteupStatus::PendingReview, WriteupStatus::Archived],
            WriteupStatus::PendingReview => [WriteupStatus::NeedsRevision, WriteupStatus::Approved, WriteupStatus::Rejected, WriteupStatus::Archived],
            WriteupStatus::NeedsRevision => [WriteupStatus::Draft, WriteupStatus::PendingReview, WriteupStatus::Archived],
            WriteupStatus::Approved => [WriteupStatus::Scheduled, WriteupStatus::Published, WriteupStatus::NeedsRevision, WriteupStatus::Archived],
            WriteupStatus::Scheduled => [WriteupStatus::Published, WriteupStatus::Approved, WriteupStatus::Archived],
            WriteupStatus::Published => [WriteupStatus::Archived],
            WriteupStatus::Rejected => [WriteupStatus::Draft, WriteupStatus::Archived],
            WriteupStatus::Archived => [WriteupStatus::Draft],
        };
    }

    private function assertPublicationReady(Writeup $writeup): void
    {
        $readyTranslations = $writeup->translations()
            ->whereIn('locale', self::REQUIRED_PUBLICATION_LOCALES)
            ->whereIn('translation_status', [
                WriteupTranslationStatus::Reviewed->value,
                WriteupTranslationStatus::Published->value,
            ])
            ->count();

        if ($readyTranslations !== count(self::REQUIRED_PUBLICATION_LOCALES)) {
            throw new LogicException('Publication requires reviewed English and Persian translations.');
        }
    }
}
