<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;

test('typescript permissions mirror matches PermissionEnum cases', function () {
    $path = resource_path('js/types/permissions.ts');
    $contents = file_get_contents($path);

    expect($contents)->not->toBeFalse();

    preg_match_all("/'([a-z0-9-]+(?:\\.[a-z0-9-]+)+)'/", $contents, $matches);

    $fromTs = collect($matches[1] ?? [])
        ->unique()
        ->sort()
        ->values();

    $fromEnum = collect(PermissionEnum::cases())
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->unique()
        ->sort()
        ->values();

    $missingInTs = $fromEnum->diff($fromTs)->values()->all();
    $extraInTs = $fromTs->diff($fromEnum)->values()->all();

    expect($missingInTs)->toBe(
        [],
        'PermissionEnum cases missing from resources/js/types/permissions.ts: '
        .implode(', ', $missingInTs),
    );

    expect($extraInTs)->toBe(
        [],
        'Phantom keys in resources/js/types/permissions.ts with no PermissionEnum case: '
        .implode(', ', $extraInTs),
    );
});

/**
 * A permission no role can grant is unreachable: it shows as a checkbox in the
 * role editor, but only a super-admin (who bypasses the Gate entirely) ever
 * behaves as though they hold it. The platform `admin` matrix is hand-written,
 * so adding a case to PermissionEnum without adding it there silently creates
 * one of these.
 */
test('the platform admin role can grant every platform permission', function () {
    $granted = collect(RoleEnum::ADMIN->permissions())
        ->map(fn (PermissionEnum $permission): string => $permission->value);

    $ungrantable = collect(PermissionEnum::forDomain(PermissionDomain::PLATFORM))
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->diff($granted)
        ->sort()
        ->values()
        ->all();

    expect($ungrantable)->toBe(
        [],
        'Platform permissions absent from the admin role matrix in RoleEnum: '
        .implode(', ', $ungrantable),
    );
});

/**
 * The platform matrices must never leak a school permission — the two domains
 * are isolated, and a school permission is only ever granted inside a school's
 * own team.
 */
test('no platform role matrix contains a school permission', function () {
    $schoolPermissions = collect(PermissionEnum::forDomain(PermissionDomain::SCHOOL))
        ->map(fn (PermissionEnum $permission): string => $permission->value);

    foreach (RoleEnum::cases() as $role) {
        $leaked = collect($role->permissions())
            ->map(fn (PermissionEnum $permission): string => $permission->value)
            ->intersect($schoolPermissions)
            ->values()
            ->all();

        expect($leaked)->toBe(
            [],
            "The {$role->value} matrix contains school-domain permissions: ".implode(', ', $leaked),
        );
    }
});
