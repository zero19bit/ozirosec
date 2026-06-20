<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Writeup;

final class WriteupPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isActiveAdmin();
    }

    public function view(User $user, Writeup $writeup): bool
    {
        return $user->isActiveAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isActiveAdmin();
    }

    public function update(User $user, Writeup $writeup): bool
    {
        return $user->isActiveAdmin();
    }

    public function review(User $user, Writeup $writeup): bool
    {
        return $user->isActiveAdmin();
    }

    public function publish(User $user, Writeup $writeup): bool
    {
        return $user->isActiveAdmin();
    }

    public function delete(User $user, Writeup $writeup): bool
    {
        return $user->isActiveAdmin();
    }

    public function manageSources(User $user): bool
    {
        return $user->isActiveAdmin();
    }

    public function viewAutomation(User $user): bool
    {
        return $user->isActiveAdmin();
    }
}
