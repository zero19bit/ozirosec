<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

final class UserAdministrationPolicy
{
    public function viewAny(User $actor): bool
    {
        return $this->activeAdmin($actor);
    }

    public function viewMetrics(User $actor): bool
    {
        return $this->activeAdmin($actor);
    }

    public function viewLogs(User $actor): bool
    {
        return $this->activeAdmin($actor);
    }

    public function update(User $actor, User $target): bool
    {
        return $this->activeAdmin($actor)
            && $actor->getKey() !== $target->getKey();
    }

    private function activeAdmin(User $user): bool
    {
        return $user->role === UserRole::Admin
            && $user->suspended_at === null;
    }
}
