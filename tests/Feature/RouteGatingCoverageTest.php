<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use Illuminate\Support\Facades\Route;

/**
 * Exhaustive route-gating invariants.
 *
 * The behavioural tests in RoutePermissionGatingTest prove a handful of routes
 * refuse the wrong actor. These walk the whole route collection instead, so a
 * newly added route cannot ship without a gate just because nobody wrote a test
 * for it. Everything here is derived from the router, never a hand-kept list.
 *
 * @return array<int, array{name: string, middleware: array<int, string>}>
 */
function routesNamed(string $prefix): array
{
    $matches = [];

    foreach (Route::getRoutes() as $route) {
        $name = $route->getName();

        if ($name === null || ! str_starts_with($name, $prefix)) {
            continue;
        }

        $matches[] = ['name' => $name, 'middleware' => $route->gatherMiddleware()];
    }

    usort($matches, fn (array $a, array $b): int => strcmp($a['name'], $b['name']));

    return $matches;
}

/**
 * @param  array<int, string>  $middleware
 */
function hasMiddleware(array $middleware, string $needle): bool
{
    foreach ($middleware as $entry) {
        if (! is_string($entry)) {
            continue;
        }

        if ($entry === $needle || str_starts_with($entry, $needle.':')) {
            return true;
        }
    }

    return false;
}

/**
 * @return array<int, string>
 */
function routesMissing(string $prefix, string $middleware): array
{
    return collect(routesNamed($prefix))
        ->reject(fn (array $route): bool => hasMiddleware($route['middleware'], $middleware))
        ->pluck('name')
        ->values()
        ->all();
}

/**
 * Routes this application declares, excluding those registered by Fortify,
 * Telescope and the framework itself.
 *
 * @return array<int, array{name: string, middleware: array<int, string>}>
 */
function applicationRoutes(): array
{
    $matches = [];

    // Routes the framework and first-party packages register for themselves:
    // Fortify's auth endpoints, the /up health check, and the local disk's
    // file-serving routes. Matched by name because they are plain closures
    // registered from a service provider, with no controller to inspect.
    $notOurs = ['up', 'storage.local', 'storage.local.upload'];

    foreach (Route::getRoutes() as $route) {
        $controller = $route->getAction('controller');

        if (is_string($controller)) {
            $controller = ltrim($controller, '\\');

            if (str_starts_with($controller, 'Laravel\\') || str_starts_with($controller, 'Illuminate\\')) {
                continue;
            }
        }

        // The health check is registered without a name, so fall back to the URI
        // to keep every route identifiable in failure output.
        $identifier = $route->getName() ?? $route->uri();

        if (in_array($identifier, $notOurs, true)) {
            continue;
        }

        $matches[] = [
            'name' => $identifier,
            'middleware' => $route->gatherMiddleware(),
        ];
    }

    usort($matches, fn (array $a, array $b): int => strcmp($a['name'], $b['name']));

    return $matches;
}

test('every application route carries a permission gate or a documented reason not to', function () {
    // The prefix-scoped tests below cannot see a route added outside
    // platform/school/teacher — the file-upload and icon-picker demos live in
    // web.php. This walks everything instead, so the only way to ship an
    // ungated route is to name it here on purpose.
    $ungatedByDesign = [
        // Public marketing page.
        'home',
        // Universal entry point: dispatches each account type to its own
        // dashboard, so every authenticated account must be able to reach it.
        'dashboard',
        // Self-service account management: gating these behind a grantable
        // permission would let an admin lock a user out of their own profile.
        'profile.edit',
        'profile.update',
        'profile.destroy',
        'security.edit',
        'user-password.update',
        'appearance.edit',
    ];

    $ungated = collect(applicationRoutes())
        ->reject(fn (array $route): bool => hasMiddleware($route['middleware'], 'permission'))
        ->pluck('name')
        // Teachers hold no roles at all — their access derives from course
        // enrollments — so teacher.* is gated by account type instead.
        ->reject(fn (string $name): bool => str_starts_with($name, 'teacher.'))
        ->reject(fn (string $name): bool => in_array($name, $ungatedByDesign, true))
        ->values()
        ->all();

    expect($ungated)->toBe(
        [],
        'These routes carry no permission gate. Gate them, or add them to $ungatedByDesign with a reason: '
        .implode(', ', $ungated),
    );
});

test('the disk holding certificate pdfs is never served publicly', function () {
    // storage.local is exempt from the test above because Laravel's ServeFile
    // aborts unless the request carries a valid signature — but it only demands
    // one while the disk's visibility is private. Flipping this disk to public
    // would turn GET /storage/{path} into an unauthenticated reader for every
    // issued certificate, sidestepping the gated download routes completely.
    $local = config('filesystems.disks.local');

    expect($local['driver'])->toBe('local')
        ->and($local['visibility'] ?? 'private')->toBe('private');
});

test('the platform and school route groups are not empty', function () {
    // Guards the tests below from passing because a prefix stopped matching.
    expect(routesNamed('platform.'))->not->toBeEmpty()
        ->and(routesNamed('school.'))->not->toBeEmpty()
        ->and(routesNamed('teacher.'))->not->toBeEmpty();
});

test('every platform route is gated by a permission', function () {
    $ungated = routesMissing('platform.', 'permission');

    expect($ungated)->toBe(
        [],
        'These platform routes carry no permission: middleware: '.implode(', ', $ungated),
    );
});

test('every school route is gated by a permission', function () {
    $ungated = routesMissing('school.', 'permission');

    expect($ungated)->toBe(
        [],
        'These school routes carry no permission: middleware: '.implode(', ', $ungated),
    );
});

test('every dashboard route is restricted to its own account type', function () {
    $cases = [
        'platform.' => 'platform',
        'school.' => 'school',
        'teacher.' => 'teacher',
    ];

    foreach ($cases as $prefix => $type) {
        $unrestricted = collect(routesNamed($prefix))
            ->reject(fn (array $route): bool => in_array('type:'.$type, $route['middleware'], true))
            ->pluck('name')
            ->values()
            ->all();

        expect($unrestricted)->toBe(
            [],
            "These {$prefix}* routes are missing type:{$type}: ".implode(', ', $unrestricted),
        );
    }
});

test('every school route resolves the tenant', function () {
    // Without `tenant` the active permission team is never set to the school,
    // so a school route's permission check would resolve against team 0.
    $untenanted = routesMissing('school.', 'tenant');

    expect($untenanted)->toBe(
        [],
        'These school routes never resolve the tenant: '.implode(', ', $untenanted),
    );
});

test('every branch management route additionally requires head office', function () {
    // Branch structure is a head-office action: holding school.branches.* through
    // a role must not be enough. The read-only locations directory is a separate
    // module and deliberately stays reachable by branch-pinned staff.
    $routes = routesNamed('school.branches.');

    expect($routes)->not->toBeEmpty();

    $missing = collect($routes)
        ->reject(fn (array $route): bool => in_array('head_office', $route['middleware'], true))
        ->pluck('name')
        ->values()
        ->all();

    expect($missing)->toBe(
        [],
        'These branch routes are missing head_office: '.implode(', ', $missing),
    );

    expect(routesNamed('school.locations.'))->not->toBeEmpty();

    foreach (routesNamed('school.locations.') as $route) {
        expect($route['middleware'])->not->toContain('head_office');
    }
});

/**
 * Every permission named by a route's middleware, flattened across the
 * `permission:a|b` form Spatie accepts.
 *
 * @return array<int, array{route: string, permission: string}>
 */
function routePermissionGates(string $prefix): array
{
    $gates = [];

    foreach (routesNamed($prefix) as $route) {
        foreach ($route['middleware'] as $entry) {
            if (! is_string($entry) || ! str_starts_with($entry, 'permission:')) {
                continue;
            }

            foreach (explode('|', substr($entry, strlen('permission:'))) as $permission) {
                $gates[] = ['route' => $route['name'], 'permission' => $permission];
            }
        }
    }

    return $gates;
}

test('every route gate names a permission that exists in the catalogue', function () {
    // Routes interpolate PermissionEnum today, so this cannot drift while that
    // holds. It exists because a raw string would still boot: Spatie treats an
    // unknown permission as simply "not granted", so a typo would 403 everyone
    // except super-admins rather than raising anything.
    $known = collect(PermissionEnum::cases())
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->all();

    $unknown = [];

    foreach (['platform.', 'school.', 'teacher.'] as $prefix) {
        foreach (routePermissionGates($prefix) as $gate) {
            if (! in_array($gate['permission'], $known, true)) {
                $unknown[] = $gate['route'].' => '.$gate['permission'];
            }
        }
    }

    expect($unknown)->toBe(
        [],
        'These routes are gated by a permission that is not in PermissionEnum: '.implode(', ', $unknown),
    );
});

test('a route is never gated by a permission from the other domain', function () {
    // A school route gated by a platform permission resolves its check against
    // the platform team, so school staff could never satisfy it; the reverse is
    // unreachable for platform staff. Both fail closed, and both look like the
    // page is simply broken.
    $mismatched = [];

    $expectedDomain = [
        'platform.' => PermissionDomain::PLATFORM,
        'school.' => PermissionDomain::SCHOOL,
    ];

    foreach ($expectedDomain as $prefix => $domain) {
        // Without this the loop below would pass by simply finding nothing.
        expect(routePermissionGates($prefix))->not->toBeEmpty();

        foreach (routePermissionGates($prefix) as $gate) {
            $permission = PermissionEnum::tryFrom($gate['permission']);

            if ($permission === null || $permission->domain() === $domain) {
                continue;
            }

            $mismatched[] = $gate['route'].' => '.$gate['permission'];
        }
    }

    expect($mismatched)->toBe(
        [],
        'These routes are gated by a permission from the wrong domain: '.implode(', ', $mismatched),
    );
});

test('every authenticated route requires authentication', function () {
    foreach (['platform.', 'school.', 'teacher.'] as $prefix) {
        $unauthenticated = routesMissing($prefix, 'auth');

        expect($unauthenticated)->toBe(
            [],
            "These {$prefix}* routes are missing auth: ".implode(', ', $unauthenticated),
        );
    }
});
