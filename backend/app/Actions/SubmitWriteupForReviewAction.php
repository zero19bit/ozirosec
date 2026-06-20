<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\WriteupStatus;
use App\Models\User;
use App\Models\Writeup;

final class SubmitWriteupForReviewAction
{
    public function __construct(private readonly TransitionWriteupAction $transition) {}

    public function handle(Writeup $writeup, User $actor): Writeup
    {
        return $this->transition->handle($writeup, $actor, WriteupStatus::PendingReview);
    }
}
