<?php

use App\Enums\PermissionDomain;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;

/**
 * The AquaCert table components fail closed: omit `exportPermission` and the
 * Export button never renders, omit `createPermission` and the create button
 * never renders. These tests make sure no page silently loses its gate — a
 * dropped prop would hide the button rather than expose ungated data, but the
 * page would still be wrong.
 *
 * @return array<string, array{0: string, 1: string}>
 */
function pagesRenderingTables(): array
{
    $root = dirname(__DIR__, 2).'/resources/js/pages';

    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));

    $pages = [];

    foreach ($files as $file) {
        if ($file->getExtension() !== 'tsx') {
            continue;
        }

        $contents = (string) file_get_contents($file->getPathname());

        $rendersTable = str_contains($contents, '<ModuleFixturePage')
            || str_contains($contents, '<StaticModulePage')
            || str_contains($contents, '<DataTableToolbar');

        if (! $rendersTable) {
            continue;
        }

        $page = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));

        $pages[$page] = [$page, $contents];
    }

    ksort($pages);

    return $pages;
}

/**
 * @return array<string, array{0: string, 1: string}>
 */
function pagesRenderingFixtureModules(): array
{
    return array_filter(
        pagesRenderingTables(),
        fn (array $case): bool => str_contains($case[1], '<ModuleFixturePage'),
    );
}

test('every page that renders a data table declares an export permission', function (string $page, string $contents) {
    expect($contents)->toContain('exportPermission');
})->with(fn (): array => pagesRenderingTables());

test('every fixture module page declares a create permission', function (string $page, string $contents) {
    expect($contents)->toContain('createPermission');
})->with(fn (): array => pagesRenderingFixtureModules());

test('the platform admin role can export every platform module', function () {
    $exportPermissions = collect(PermissionEnum::forDomain(PermissionDomain::PLATFORM))
        ->filter(fn (PermissionEnum $permission): bool => str_ends_with($permission->value, '.export'))
        ->map(fn (PermissionEnum $permission): string => $permission->value);

    $adminPermissions = collect(RoleEnum::ADMIN->permissions())
        ->map(fn (PermissionEnum $permission): string => $permission->value);

    expect($exportPermissions)->not->toBeEmpty()
        ->and($exportPermissions->diff($adminPermissions)->all())->toBeEmpty();
});

test('every module that can be listed in the school domain can also be exported', function () {
    /**
     * Branch structure, the dashboard and settings are single-purpose screens
     * with no exportable table, so they are absent by design.
     */
    $withoutExport = ['school.branches', 'school.dashboard', 'school.settings'];

    $permissions = collect(PermissionEnum::forDomain(PermissionDomain::SCHOOL))
        ->map(fn (PermissionEnum $permission): string => $permission->value);

    $listable = $permissions
        ->filter(fn (string $permission): bool => str_ends_with($permission, '.index'))
        ->map(fn (string $permission): string => str($permission)->beforeLast('.index')->value())
        ->reject(fn (string $module): bool => in_array($module, $withoutExport, true));

    $missing = $listable->reject(
        fn (string $module): bool => $permissions->contains($module.'.export'),
    );

    expect($missing->all())->toBeEmpty();
});
