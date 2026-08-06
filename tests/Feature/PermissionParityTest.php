<?php

use App\Enums\PermissionEnum;

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
