<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to accounts of one or more user types, keeping the three
 * dashboards isolated from one another.
 *
 * Usage: `->middleware('type:platform')`, `->middleware('type:school')`, etc.
 */
class EnsureUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$types): Response
    {
        $user = $request->user();

        abort_if($user === null, 403);
        abort_unless(in_array($user->type->value, $types, true), 403);

        return $next($request);
    }
}
