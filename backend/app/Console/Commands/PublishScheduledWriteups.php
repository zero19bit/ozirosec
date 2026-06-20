<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\WriteupStatus;
use App\Models\Writeup;
use App\Services\WriteupStatusTransitionPolicy;
use Illuminate\Console\Command;
use LogicException;

final class PublishScheduledWriteups extends Command
{
    protected $signature = 'writeups:publish-scheduled';

    protected $description = 'Publish due, approved write-ups exactly once.';

    public function handle(WriteupStatusTransitionPolicy $policy): int
    {
        $published = 0;

        Writeup::query()->scheduled()->where('scheduled_for', '<=', now())->orderBy('id')->eachById(function (Writeup $writeup) use ($policy, &$published): void {
            try {
                $policy->transition($writeup, WriteupStatus::Published);
                $writeup->save();
                $published++;
            } catch (LogicException) {
                // Leave ineligible records scheduled for an administrator to resolve.
            }
        });

        $this->info("Published {$published} scheduled write-up(s).");

        return self::SUCCESS;
    }
}
