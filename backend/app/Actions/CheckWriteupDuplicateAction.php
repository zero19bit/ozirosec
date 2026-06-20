<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Writeup;
use App\Support\WriteupUrlNormalizer;

final class CheckWriteupDuplicateAction
{
    /** @return array{is_duplicate: bool, reason: ?string, writeup_id: ?int} */
    public function handle(?string $canonicalUrl, ?int $sourceId, ?string $sourceGuid, ?string $contentHash): array
    {
        $urlHash = WriteupUrlNormalizer::sha256($canonicalUrl);
        $guidHash = $sourceGuid === null || trim($sourceGuid) === '' ? null : hash('sha256', trim($sourceGuid));
        $match = Writeup::withTrashed()
            ->when($urlHash !== null, fn ($query) => $query->orWhere('canonical_url_hash', $urlHash))
            ->when($sourceId !== null && $guidHash !== null, fn ($query) => $query->orWhere(fn ($nested) => $nested->where('source_id', $sourceId)->where('source_guid_hash', $guidHash)))
            ->when($contentHash !== null, fn ($query) => $query->orWhere('content_hash', $contentHash))
            ->first();

        if ($match === null) {
            return ['is_duplicate' => false, 'reason' => null, 'writeup_id' => null];
        }

        $reason = $urlHash !== null && $match->canonical_url_hash === $urlHash ? 'canonical_url'
            : ($guidHash !== null && $match->source_guid_hash === $guidHash ? 'source_guid' : 'content_hash');

        return ['is_duplicate' => true, 'reason' => $reason, 'writeup_id' => $match->id];
    }
}
