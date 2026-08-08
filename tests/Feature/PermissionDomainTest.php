<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;

test('permissions are seeded with a domain', function () {
    $this->seed(PermissionSeeder::class);

    expect(Permission::whereNull('domain')->count())->toBe(0)
        ->and(Permission::where('domain', 'platform')->count())->toBeGreaterThan(0)
        ->and(Permission::where('domain', 'school')->count())->toBeGreaterThan(0);

    // Every school.* permission row is tagged as the school domain.
    Permission::where('name', 'like', 'school.%')->get()
        ->each(fn (Permission $p) => expect($p->domain)->toBe('school'));
});

test('the platform and school permission sets are fully disjoint', function () {
    $platform = collect(PermissionEnum::forDomain(PermissionDomain::PLATFORM))
        ->map(fn (PermissionEnum $p): string => $p->value);
    $school = collect(PermissionEnum::forDomain(PermissionDomain::SCHOOL))
        ->map(fn (PermissionEnum $p): string => $p->value);

    expect($platform->intersect($school))->toBeEmpty()
        ->and($platform->contains('school.staff.index'))->toBeFalse()
        ->and($school->contains('users.index'))->toBeFalse();

    foreach (PermissionEnum::forDomain(PermissionDomain::SCHOOL) as $permission) {
        expect($permission->value)->toStartWith('school.')
            ->and($permission->domain())->toBe(PermissionDomain::SCHOOL);
    }
});

test('the school name prefix and the school domain never disagree', function () {
    // PermissionEnum::domain() ends in `default => PLATFORM`, so a new school.*
    // case that is missing from the SCHOOL match arm silently becomes a platform
    // permission — it would vanish from the school role editor and be accepted
    // by the platform one.
    //
    // The disjoint test above cannot catch this: it only walks
    // forDomain(SCHOOL), and a misfiled case is absent from that list entirely.
    // This walks every case instead, needs no seeded rows, and names the
    // offenders so the fix is obvious.
    $misfiled = collect(PermissionEnum::cases())
        ->filter(fn (PermissionEnum $permission): bool => str_starts_with($permission->value, 'school.')
            && $permission->domain() !== PermissionDomain::SCHOOL)
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->values()
        ->all();

    expect($misfiled)->toBe(
        [],
        'These school.* permissions fell through to the PLATFORM default. Add them to the SCHOOL arm of PermissionEnum::domain(): '
        .implode(', ', $misfiled),
    );

    // The inverse: a permission in the SCHOOL domain must carry the prefix, so
    // the convention stays a reliable signal in both directions.
    $mislabelled = collect(PermissionEnum::cases())
        ->filter(fn (PermissionEnum $permission): bool => $permission->domain() === PermissionDomain::SCHOOL
            && ! str_starts_with($permission->value, 'school.'))
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->values()
        ->all();

    expect($mislabelled)->toBe(
        [],
        'These permissions are in the SCHOOL domain but lack the school. prefix: '
        .implode(', ', $mislabelled),
    );
});

test('every permission resolves a display group', function () {
    // group() has no default arm, so a case missing from it throws
    // UnhandledMatchError rather than failing quietly.
    foreach (PermissionEnum::cases() as $permission) {
        expect($permission->group())->toBeString()->not->toBeEmpty();
    }

    expect(PermissionEnum::SCHOOL_BRANCHES_INDEX->group())->toBe('Branches');
});

test('every platform-prefixed permission resolves to the PLATFORM domain', function () {
    $misfiled = collect(PermissionEnum::cases())
        ->filter(fn (PermissionEnum $permission): bool => str_starts_with($permission->value, 'platform.')
            && $permission->domain() !== PermissionDomain::PLATFORM)
        ->map(fn (PermissionEnum $permission): string => $permission->value)
        ->values()
        ->all();

    expect($misfiled)->toBe(
        [],
        'These platform.* permissions are not in the PLATFORM domain: '
        .implode(', ', $misfiled),
    );
});

test('new display groups are non-empty', function () {
    $requiredGroups = [
        'Locations',
        'Subscriptions',
        'Learning',
        'Pathways',
        'Assessments',
        'Certificates',
        'Reports',
        'Notifications',
        'Support Tools',
        'System',
        'Library',
        'Assignments',
    ];

    $populated = collect(PermissionEnum::cases())
        ->map(fn (PermissionEnum $permission): string => $permission->group())
        ->unique()
        ->all();

    foreach ($requiredGroups as $group) {
        expect($populated)->toContain($group);
    }
});
