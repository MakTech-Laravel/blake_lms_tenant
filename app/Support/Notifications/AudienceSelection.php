<?php

namespace App\Support\Notifications;

use App\Enums\NotificationAudience;
use App\Models\School;

/**
 * The addressing half of a notification: a targeting mode plus, for the modes
 * that need one, a list of ids.
 *
 * Stays a pure value object. Turning a selection into actual users, and into the
 * human label stored on the notification, both need database access and live in
 * AudienceResolver instead.
 *
 * `schoolId` clamps every mode to one organization. It is set for school-composed
 * announcements so a school author physically cannot reach outside their own
 * people, however the mode is chosen.
 */
class AudienceSelection
{
    /**
     * @param  array<int, int>  $ids
     */
    private function __construct(
        public readonly NotificationAudience $type,
        public readonly array $ids,
        public readonly ?int $schoolId,
    ) {}

    /**
     * @param  array<int, int|string>  $ids
     */
    public static function make(NotificationAudience $type, array $ids = [], ?int $schoolId = null): self
    {
        return new self($type, self::normalizeIds($ids), $schoolId);
    }

    public static function allUsers(?int $schoolId = null): self
    {
        return self::make(NotificationAudience::AllUsers, [], $schoolId);
    }

    public static function platformUsers(): self
    {
        return self::make(NotificationAudience::AllPlatformUsers);
    }

    public static function schoolStaff(?int $schoolId = null): self
    {
        return self::make(NotificationAudience::AllSchoolStaff, [], $schoolId);
    }

    public static function teachers(?int $schoolId = null): self
    {
        return self::make(NotificationAudience::AllTeachers, [], $schoolId);
    }

    public static function allOrganizations(): self
    {
        return self::make(NotificationAudience::AllOrganizations);
    }

    /**
     * @param  array<int, int|string>  $schoolIds
     */
    public static function organizations(array $schoolIds): self
    {
        return self::make(NotificationAudience::SelectedOrganizations, $schoolIds);
    }

    /**
     * @param  array<int, int|string>  $planIds
     */
    public static function plans(array $planIds): self
    {
        return self::make(NotificationAudience::SubscriptionPlan, $planIds);
    }

    /**
     * Role ids, never role names: roles are team-scoped by school, so the same
     * name exists once per organization.
     *
     * @param  array<int, int|string>  $roleIds
     */
    public static function roles(array $roleIds, ?int $schoolId = null): self
    {
        return self::make(NotificationAudience::Roles, $roleIds, $schoolId);
    }

    /**
     * @param  array<int, int|string>  $userIds
     */
    public static function individuals(array $userIds, ?int $schoolId = null): self
    {
        return self::make(NotificationAudience::IndividualUsers, $userIds, $schoolId);
    }

    /**
     * Rebuild a selection from validated request input or a stored notification.
     *
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, ?int $schoolId = null): self
    {
        $type = $data['audience_type'] ?? null;

        $audience = $type instanceof NotificationAudience
            ? $type
            : NotificationAudience::tryFrom((string) $type) ?? NotificationAudience::AllUsers;

        $key = $audience->selectionKey();
        $ids = $key !== null ? ($data[$key] ?? $data['audience'][$key] ?? []) : [];

        return self::make($audience, is_array($ids) ? $ids : [], $schoolId);
    }

    /**
     * Clamp this selection to a single organization.
     */
    public function withinSchool(School|int|null $school): self
    {
        $schoolId = $school instanceof School ? $school->id : $school;

        return new self($this->type, $this->ids, $schoolId);
    }

    /**
     * Whether this mode needs ids but was given none, which would otherwise
     * address nobody.
     */
    public function isIncomplete(): bool
    {
        return $this->type->requiresSelection() && $this->ids === [];
    }

    /**
     * The JSON payload stored in the `audience` column, or NULL for the modes
     * that carry no ids.
     *
     * @return array<string, array<int, int>>|null
     */
    public function payload(): ?array
    {
        $key = $this->type->selectionKey();

        if ($key === null || $this->ids === []) {
            return null;
        }

        return [$key => $this->ids];
    }

    /**
     * @param  array<int, int|string>  $ids
     * @return array<int, int>
     */
    private static function normalizeIds(array $ids): array
    {
        return array_values(array_unique(array_filter(
            array_map(fn (mixed $id): int => (int) $id, $ids),
            fn (int $id): bool => $id > 0,
        )));
    }
}
