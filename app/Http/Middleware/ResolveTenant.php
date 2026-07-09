<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the current school (tenant) from the `{school}` route segment and
 * sets it as Spatie's active team so all role/permission checks for the request
 * are scoped to that school.
 *
 * This middleware is placed first in the school route group so the team id is
 * set before the `permission:` middleware, route-model binding, and the Inertia
 * shared-data pass run.
 */
class ResolveTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $routeSchool = $request->route('school');

        // Resolve the school ourselves (by slug) rather than relying on
        // route-model binding, which runs later. If binding already ran, the
        // parameter is the model instance.
        $school = $routeSchool instanceof School
            ? $routeSchool
            : School::where('slug', $routeSchool)->firstOrFail();

        abort_if(! $school->is_active, 403, 'This school is not active.');

        // School staff may only operate within their own school.
        $user = $request->user();
        if ($user !== null && $user->isSchoolStaff() && $user->school_id !== $school->id) {
            abort(403, 'You do not belong to this school.');
        }

        // Scope every subsequent role/permission check to this school's team.
        setPermissionsTeamId($school->id);

        // Reset any relations already loaded under a different team context.
        $user?->unsetRelation('roles')->unsetRelation('permissions');

        // Make the resolved model available to binding and Inertia sharing.
        $request->route()->setParameter('school', $school);
        $request->attributes->set('school', $school);

        return $next($request);
    }
}
