<?php

declare(strict_types=1);

namespace App\Enums;

enum WriteupStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case NeedsRevision = 'needs_revision';
    case Approved = 'approved';
    case Scheduled = 'scheduled';
    case Published = 'published';
    case Rejected = 'rejected';
    case Archived = 'archived';
}
