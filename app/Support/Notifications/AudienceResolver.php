<?php

namespace App\Support\Notifications;

use App\Enums\NotificationAudience;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\Plan;
use App\Models\School;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * Turns an AudienceSelection into the people it addresses, and into the human
 * label stored alongside the notification.
 *
 * Two rules hold for every mode:
 *
 *  - Disabled accounts are never included. Nobody is going to read it, and
 *    mailing a deactivated address is worse than not sending at all.
 *  - A mode that expects ids but was handed none resolves to nobody. Falling
 *    back to "everyone" here would turn an authoring slip into a broadcast to
 *    the entire platform.
 */
class AudienceResolver
{
    /**
     * The users this selection addresses.
     *
     * @return Builder<User>
     */
    public function query(AudienceSelection $selection): Builder
    {
        $query = User::query()->where('users.status', '!=', UserStatus::Disabled->value);

        if ($selection->isIncomplete()) {
            return $query->whereRaw('1 = 0');
        }

        $this->constrain($query, $selection);

        // School-composed announcements are clamped to their own organization
        // whatever mode was chosen, so a school author cannot reach outside it.
        if ($selection->schoolId !== null) {
            $query->where('users.school_id', $selection->schoolId);
        }

        return $query;
    }

    /**
     * How many people the selection currently reaches. Drives the builder's
     * live estimate.
     */
    public function count(AudienceSelection $selection): int
    {
        return $this->query($selection)->count();
    }

    /**
     * The human summary stored as `audience_label`.
     *
     * Resolved once at authoring time and denormalized, so the list still reads
     * correctly after a targeted organization, plan, or role is deleted.
     */
    public function describe(AudienceSelection $selection): string
    {
        if ($selection->isIncomplete()) {
            return $selection->type->label();
        }

        return match ($selection->type) {
            NotificationAudience::SelectedOrganizations => $this->summarize(
                School::query()->whereKey($selection->ids)->orderBy('name')->pluck('name')->all(),
                'organization',
            ),
            NotificationAudience::SubscriptionPlan => $this->summarize(
                Plan::withTrashed()->whereKey($selection->ids)->orderBy('name')->pluck('name')
                    ->map(fn (string $name): string => $name.' Plan')->all(),
                'plan',
            ),
            NotificationAudience::Roles => $this->summarize(
                Role::query()->whereKey($selection->ids)->orderBy('name')->pluck('name')
                    ->map(fn (string $name): string => Str::headline($name))->all(),
                'role',
            ),
            NotificationAudience::IndividualUsers => $this->summarize(
                User::query()->whereKey($selection->ids)->orderBy('name')->pluck('name')->all(),
                'person',
                'people',
            ),
            default => $selection->type->label(),
        };
    }

    /**
     * Apply the mode's own predicate.
     *
     * @param  Builder<User>  $query
     */
    private function constrain(Builder $query, AudienceSelection $selection): void
    {
        match ($selection->type) {
            NotificationAudience::AllUsers => null,

            NotificationAudience::AllPlatformUsers => $query->where('users.type', UserType::PLATFORM->value),

            NotificationAudience::AllSchoolStaff => $query->where('users.type', UserType::SCHOOL->value),

            NotificationAudience::AllTeachers => $query->where('users.type', UserType::TEACHER->value),

            NotificationAudience::AllOrganizations => $query->whereNotNull('users.school_id'),

            NotificationAudience::SelectedOrganizations => $query->whereIn('users.school_id', $selection->ids),

            NotificationAudience::SubscriptionPlan => $query->whereIn(
                'users.school_id',
                Subscription::query()->whereIn('plan_id', $selection->ids)->select('school_id'),
            ),

            NotificationAudience::Roles => $this->constrainToRoles($query, $selection->ids),

            NotificationAudience::IndividualUsers => $query->whereKey($selection->ids),
        };
    }

    /**
     * Match holders of specific roles.
     *
     * Queried against the pivot directly rather than through Spatie's `role()`
     * scope: role ids already identify one team's role, so layering Spatie's
     * team filter on top would drop every role belonging to a school other than
     * the request's current team.
     *
     * @param  Builder<User>  $query
     * @param  array<int, int>  $roleIds
     */
    private function constrainToRoles(Builder $query, array $roleIds): void
    {
        $pivot = config('permission.table_names.model_has_roles');
        $morphKey = config('permission.column_names.model_morph_key');
        $morphClass = (new User)->getMorphClass();

        $query->whereExists(fn (QueryBuilder $builder) => $builder
            ->from($pivot)
            ->whereColumn($pivot.'.'.$morphKey, 'users.id')
            ->where($pivot.'.model_type', $morphClass)
            ->whereIn($pivot.'.role_id', $roleIds));
    }

    /**
     * Name the target when there are only a couple, and count it otherwise.
     *
     * @param  array<int, string>  $names
     */
    private function summarize(array $names, string $singular, ?string $plural = null): string
    {
        $plural ??= Str::plural($singular);

        if ($names === []) {
            return 'No '.$plural;
        }

        if (count($names) <= 2) {
            return implode(' and ', $names);
        }

        return count($names).' '.$plural;
    }
}
