<?php

declare(strict_types=1);

namespace App\Enums;

enum WriteupTranslationStatus: string
{
    case Missing = 'missing';
    case MachineGenerated = 'machine_generated';
    case NeedsReview = 'needs_review';
    case Reviewed = 'reviewed';
    case Published = 'published';

    public function isPublicationReady(): bool
    {
        return $this === self::Reviewed || $this === self::Published;
    }
}
