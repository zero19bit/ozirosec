<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_if($user === null, 401, 'Authentication required.');
        abort_if($user->role !== UserRole::Admin, 403, 'Admin privileges required.');
        abort_if($user->suspended_at !== null, 403, 'This account is suspended.');

        return $next($request);
    }
}
