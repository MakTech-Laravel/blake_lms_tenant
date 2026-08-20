<?php

namespace App\Enums;

/**
 * Who an announcement is addressed to.
 *
 * The mode alone is not always enough: the four "Selected"/"Roles"/"Individual"
 * modes carry a payload of ids, which is why `selectionKey()` exists. The mode
 * plus its payload is resolved into a set of users by AudienceResolver.
 *
 * Two constraints shape this list:
 *  - Teachers hold no Spatie roles at all, so a role-targeted announcement can
 *    never reach one. Teachers are addressed by type, organization, or by name.
 *  - Roles are team-scoped by `school_id`, so role names repeat across
 *    organizations. Targeting therefore uses role ids, never role names.
 */
enum NotificationAudience: string
{
    case AllUsers = 'all_users';
    case AllPlatformUsers = 'all_platform_users';
    case AllSchoolStaff = 'all_school_staff';
    case AllTeachers = 'all_teachers';
    case AllOrganizations = 'all_organizations';
    case SelectedOrganizations = 'selected_organizations';
    case SubscriptionPlan = 'subscription_plan';
    case Roles = 'roles';
    case IndividualUsers = 'individual_users';

    public function label(): string
    {
        return match ($this) {
            self::AllUsers => 'All Users',
            self::AllPlatformUsers => 'All Platform Users',
            self::AllSchoolStaff => 'All School Staff',
            self::AllTeachers => 'All Teachers',
            self::AllOrganizations => 'All Organizations',
            self::SelectedOrganizations => 'Selected Organizations',
            self::SubscriptionPlan => 'Organizations on a Plan',
            self::Roles => 'Specific Roles',
            self::IndividualUsers => 'Individual People',
        };
    }

    /**
     * Hint shown under the audience picker.
     */
    public function description(): string
    {
        return match ($this) {
            self::AllUsers => 'Everyone with an account, across every portal.',
            self::AllPlatformUsers => 'Platform staff only.',
            self::AllSchoolStaff => 'Owners, admins, and managers at every organization.',
            self::AllTeachers => 'Every teacher, at every organization.',
            self::AllOrganizations => 'Everyone who belongs to an organization: staff and teachers.',
            self::SelectedOrganizations => 'Everyone at the organizations you choose.',
            self::SubscriptionPlan => 'Everyone at organizations subscribed to the plans you choose.',
            self::Roles => 'Holders of the roles you choose. Teachers hold no roles, so they are never included.',
            self::IndividualUsers => 'Only the people you name.',
        };
    }

    /**
     * Whether this mode needs a payload of ids to be meaningful.
     */
    public function requiresSelection(): bool
    {
        return $this->selectionKey() !== null;
    }

    /**
     * The request/payload key holding this mode's ids, or NULL when the mode is
     * self-contained.
     */
    public function selectionKey(): ?string
    {
        return match ($this) {
            self::SelectedOrganizations => 'school_ids',
            self::SubscriptionPlan => 'plan_ids',
            self::Roles => 'role_ids',
            self::IndividualUsers => 'user_ids',
            default => null,
        };
    }

    /**
     * What the picker is choosing from, so the frontend knows which option list
     * to render. NULL for the self-contained modes.
     */
    public function selectionResource(): ?string
    {
        return match ($this) {
            self::SelectedOrganizations => 'organizations',
            self::SubscriptionPlan => 'plans',
            self::Roles => 'roles',
            self::IndividualUsers => 'users',
            default => null,
        };
    }

    /**
     * Audiences a platform author may address: all of them.
     *
     * @return array<int, self>
     */
    public static function platformCases(): array
    {
        return self::cases();
    }

    /**
     * Audiences a school author may address.
     *
     * Everything is implicitly narrowed to their own organization by
     * AudienceSelection's school scope, so the cross-organization modes are
     * withheld rather than silently reinterpreted.
     *
     * @return array<int, self>
     */
    public static function schoolCases(): array
    {
        return [
            self::AllUsers,
            self::AllSchoolStaff,
            self::AllTeachers,
            self::Roles,
            self::IndividualUsers,
        ];
    }

    /**
     * @return array<int, array{value: string, label: string, description: string, resource: string|null}>
     */
    public static function options(): array
    {
        return self::optionsFor(self::platformCases());
    }

    /**
     * @return array<int, array{value: string, label: string, description: string, resource: string|null}>
     */
    public static function schoolOptions(): array
    {
        return self::optionsFor(self::schoolCases());
    }

    /**
     * @param  array<int, self>  $cases
     * @return array<int, array{value: string, label: string, description: string, resource: string|null}>
     */
    public static function optionsFor(array $cases): array
    {
        return array_map(
            fn (self $audience): array => [
                'value' => $audience->value,
                'label' => $audience->label(),
                'description' => $audience->description(),
                'resource' => $audience->selectionResource(),
            ],
            $cases,
        );
    }

    /**
     * Plain value/label pairs for the filter popover, which has no room for the
     * descriptions.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function filterOptions(): array
    {
        return array_map(
            fn (self $audience): array => ['value' => $audience->value, 'label' => $audience->label()],
            self::cases(),
        );
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $audience): string => $audience->value, self::cases());
    }
}
