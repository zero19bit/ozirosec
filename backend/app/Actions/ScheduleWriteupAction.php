<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\WriteupStatus;
use App\Models\User;
use App\Models\Writeup;
use Illuminate\Support\Carbon;

final class ScheduleWriteupAction
{
    public function __construct(private readonly TransitionWriteupAction $transition) {}

    public function handle(Writeup $writeup, User $actor, Carbon $when): Writeup
    {
        $writeup->scheduled_for = $when;
        $writeup->save();

        return $this->transition->handle($writeup, $actor, WriteupStatus::Scheduled);
    }
}
