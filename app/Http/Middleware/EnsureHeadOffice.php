<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to head-office staff — accounts whose `branch_id` is NULL
 * and which therefore have school-wide access.
 *
 * Deliberately independent of the `permission:` gates. A branch-pinned manager
 * may well hold `school.branches.*` through a school role, since roles are
 * scoped per school and shared across its branches; they must still be refused
 * here, because changing the branch structure is a head-office action.
 *
 * Usage: `->middleware('head_office')`.
 */
class EnsureHeadOffice
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_if($user === null, 403);
        abort_unless($user->isHeadOffice(), 403, 'Only head-office staff can manage branches.');

        return $next($request);
    }
}
