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
