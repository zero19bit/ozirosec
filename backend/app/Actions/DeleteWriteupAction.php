<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Writeup;

final class DeleteWriteupAction
{
    public function handle(Writeup $writeup): void
    {
        $writeup->delete();
    }
}
