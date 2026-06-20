<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\WriteupStatus;
use App\Models\User;
use App\Models\Writeup;
use App\Services\WriteupStatusTransitionPolicy;
use Illuminate\Support\Facades\DB;

final class TransitionWriteupAction
{
    public function __construct(private readonly WriteupStatusTransitionPolicy $policy) {}

    public function handle(Writeup $writeup, User $actor, WriteupStatus $status): Writeup
    {
        return DB::transaction(function () use ($writeup, $actor, $status): Writeup {
            $locked = Writeup::query()->lockForUpdate()->findOrFail($writeup->id);
            $this->policy->transition($locked, $status);
            if ($status === WriteupStatus::Approved) {
                $locked->approved_by = $actor->id;
                $locked->approved_at = now();
            }
            if (in_array($status, [WriteupStatus::Approved, WriteupStatus::Rejected, WriteupStatus::NeedsRevision], true)) {
                $locked->reviewed_by = $actor->id;
                $locked->reviewed_at = now();
            }
            $locked->save();

            return $locked;
        });
    }
}
