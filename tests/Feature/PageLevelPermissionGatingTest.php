<?php

use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Models\School;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->withoutVite();
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('platform support page shares support action permissions for ui gating', function () {
    $user = User::factory()->platform()->create();
    $user->givePermissionTo([
        PermissionEnum::PLATFORM_SUPPORT_INDEX->value,
        PermissionEnum::PLATFORM_SUPPORT_IMPERSONATE->value,
        PermissionEnum::PLATFORM_SUPPORT_AUDIT_EXPORT->value,
    ]);

    $this->actingAs($user)
        ->get(route('platform.support.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/support/index')
            ->where('auth.user.permissions', function ($permissions) {
                $permissions = collect($permissions);

                return $permissions->contains(PermissionEnum::PLATFORM_SUPPORT_IMPERSONATE->value)
                    && $permissions->contains(PermissionEnum::PLATFORM_SUPPORT_AUDIT_EXPORT->value)
                    && ! $permissions->contains(PermissionEnum::PLATFORM_SUPPORT_PASSWORD_RESET->value)
                    && ! $permissions->contains(PermissionEnum::PLATFORM_SUPPORT_FEATURE_FLAGS->value);
            })
        );
});

test('platform certificates and system settings pages share gating permissions', function () {
    $user = User::factory()->platform()->create();
    $user->assignRole(RoleEnum::SUPER_ADMIN->value);

    $this->actingAs($user)
        ->get(route('platform.certificates.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/certificates/index')
            ->where('auth.user.is_super_admin', true)
        );

    $this->actingAs($user)
        ->get(route('platform.system_settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/system-settings/index')
        );
});

test('school billing certificates and settings pages share gating permissions', function () {
    $school = School::factory()->create();
    setPermissionsTeamId($school->id);

    $role = Role::create([
        'name' => 'billing-manager',
        'guard_name' => 'web',
        'school_id' => $school->id,
    ]);
    $role->givePermissionTo([
        PermissionEnum::SCHOOL_BILLING_VIEW->value,
        PermissionEnum::SCHOOL_BILLING_EXPORT->value,
        PermissionEnum::SCHOOL_BILLING_INVOICE_DOWNLOAD->value,
        PermissionEnum::SCHOOL_CERTIFICATES_INDEX->value,
        PermissionEnum::SCHOOL_CERTIFICATES_ISSUE->value,
        PermissionEnum::SCHOOL_CERTIFICATES_DOWNLOAD->value,
        PermissionEnum::SCHOOL_CERTIFICATES_REVOKE->value,
        PermissionEnum::SCHOOL_SETTINGS_VIEW->value,
        PermissionEnum::SCHOOL_SETTINGS_COMPLIANCE_EDIT->value,
        PermissionEnum::SCHOOL_ROLES_INDEX->value,
        PermissionEnum::SCHOOL_ROLES_CREATE->value,
        PermissionEnum::SCHOOL_COURSES_CREATE->value,
        PermissionEnum::SCHOOL_COURSES_INDEX->value,
    ]);

    $user = User::factory()->schoolStaff($school)->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('school.billing.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/billing/index')
            ->where('auth.user.permissions', function ($permissions) {
                $permissions = collect($permissions);

                return $permissions->contains(PermissionEnum::SCHOOL_BILLING_VIEW->value)
                    && $permissions->contains(PermissionEnum::SCHOOL_BILLING_EXPORT->value)
                    && $permissions->contains(PermissionEnum::SCHOOL_BILLING_INVOICE_DOWNLOAD->value);
            })
        );

    $this->actingAs($user)
        ->get(route('school.certificates.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/certificates/index')
            ->where('auth.user.permissions', function ($permissions) {
                $permissions = collect($permissions);

                return $permissions->contains(PermissionEnum::SCHOOL_CERTIFICATES_ISSUE->value)
                    && $permissions->contains(PermissionEnum::SCHOOL_CERTIFICATES_DOWNLOAD->value)
                    && $permissions->contains(PermissionEnum::SCHOOL_CERTIFICATES_REVOKE->value);
            })
        );

    $this->actingAs($user)
        ->get(route('school.settings.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/settings/index')
            ->where('auth.user.permissions', function ($permissions) {
                return collect($permissions)->contains(PermissionEnum::SCHOOL_SETTINGS_COMPLIANCE_EDIT->value);
            })
        );

    $this->actingAs($user)
        ->get(route('school.access.ui', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/access/index')
            ->where('auth.user.permissions', function ($permissions) {
                $permissions = collect($permissions);

                return $permissions->contains(PermissionEnum::SCHOOL_ROLES_CREATE->value)
                    && $permissions->contains(PermissionEnum::SCHOOL_ROLES_INDEX->value);
            })
        );

    $this->actingAs($user)
        ->get(route('school.courses.wizard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/course-wizard')
            ->where('auth.user.permissions', function ($permissions) {
                return collect($permissions)->contains(PermissionEnum::SCHOOL_COURSES_CREATE->value);
            })
        );
});
