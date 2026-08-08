<?php

namespace App\Http\Controllers\Concerns;

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\Plan;
use App\Models\School;
use App\Models\User;
use App\Support\Notifications\AudienceResolver;
use App\Support\Notifications\AudienceSelection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

/**
 * The list, filter, and row-mapping half of the notification controllers.
 *
 * Extracted because the platform and school modules are the same screen with a
 * different scope: the platform sees announcements with a NULL `school_id`, a
 * school sees its own. Sharing this keeps the two lists from drifting apart in
 * sort keys, filter names, or row shape, all of which the same frontend
 * component consumes.
 *
 * Implementors supply the routing (`notificationRoute()`) and the scope
 * (`notificationSchoolId()`).
 */
trait BuildsNotificationIndex
{
    /**
     * Columns the list may be sorted by, mapped to the SQL that orders them.
     * Whitelisted so a query string cannot reach arbitrary columns.
     *
     * @var array<string, string>
     */
    private const NOTIFICATION_SORTABLE = [
        'date' => 'timeline_at',
        'title' => 'notifications.title',
        'audience' => 'notifications.audience_label',
        'status' => 'notifications.status',
        'recipients' => 'notifications.recipients_count',
    ];

    /**
     * The status tabs, in the order the UI shows them. "All" is the absence of a
     * status filter, and the two transient states (sending, failed) surface only
     * under it rather than earning a tab nobody would click.
     *
     * @var array<int, string>
     */
    private const NOTIFICATION_TABS = ['draft', 'scheduled', 'sent', 'archived'];

    /**
     * Build a URL for one of this module's notification routes.
     */
    abstract protected function notificationRoute(string $action, ?Notification $notification = null): string;

    /**
     * The organization whose announcements this module manages, or NULL for the
     * platform's own.
     */
    abstract protected function notificationSchoolId(): ?int;

    /**
     * The audience modes authors in this module may choose from.
     *
     * @return array<int, NotificationAudience>
     */
    abstract protected function notificationAudienceCases(): array;

    /**
     * @return array{search: string, status: string, category: string, audience: string, priority: string, sort: string, direction: string}
     */
    protected function resolveNotificationFilters(Request $request): array
    {
        $status = strtolower(trim((string) $request->query('status', '')));
        $category = strtolower(trim((string) $request->query('category', '')));
        $audience = strtolower(trim((string) $request->query('audience', '')));
        $priority = strtolower(trim((string) $request->query('priority', '')));
        $sort = strtolower(trim((string) $request->query('sort', '')));
        $direction = strtolower(trim((string) $request->query('direction', '')));

        return [
            'search' => trim((string) $request->query('search', '')),
            'status' => in_array($status, self::NOTIFICATION_TABS, true) ? $status : '',
            'category' => in_array($category, NotificationCategory::values(), true) ? $category : '',
            'audience' => in_array($audience, NotificationAudience::values(), true) ? $audience : '',
            'priority' => in_array($priority, NotificationPriority::values(), true) ? $priority : '',
            'sort' => array_key_exists($sort, self::NOTIFICATION_SORTABLE) ? $sort : 'date',
            // Newest first is the only sensible default for a broadcast log.
            'direction' => $direction === 'asc' ? 'asc' : 'desc',
        ];
    }

    /**
     * The shared list query, reused by both the index and the export so what is
     * downloaded always matches what is on screen.
     *
     * `timeline_at` collapses the three dates an announcement can be described
     * by into one sortable column: when it went out, when it is due to, or when
     * the draft was written.
     *
     * @param  array{search: string, status: string, category: string, audience: string, priority: string, sort: string, direction: string}  $filters
     * @return Builder<Notification>
     */
    protected function notificationsQuery(array $filters): Builder
    {
        $sortable = self::NOTIFICATION_SORTABLE;

        return Notification::query()
            ->select('notifications.*')
            ->selectRaw('COALESCE(notifications.sent_at, notifications.scheduled_at, notifications.created_at) as timeline_at')
            ->composedBy($this->notificationSchoolId())
            ->with(['sender:id,name', 'school:id,name'])
            // withTrashed on the receipts so a recipient deleting their copy does
            // not quietly reduce the author's read count for something that was
            // genuinely read.
            ->withCount(['receipts as read_count' => fn (Builder $query) => $query
                ->withTrashed()
                ->whereNotNull('read_at')])
            ->when(
                $filters['search'] !== '',
                fn (Builder $query) => $query->where(function (Builder $builder) use ($filters): void {
                    $term = '%'.$filters['search'].'%';

                    $builder->where('notifications.title', 'like', $term)
                        ->orWhere('notifications.body', 'like', $term)
                        ->orWhere('notifications.audience_label', 'like', $term);
                }),
            )
            ->when(
                $filters['status'] !== '',
                fn (Builder $query) => $query->where('notifications.status', $filters['status']),
            )
            ->when(
                $filters['category'] !== '',
                fn (Builder $query) => $query->where('notifications.category', $filters['category']),
            )
            ->when(
                $filters['audience'] !== '',
                fn (Builder $query) => $query->where('notifications.audience_type', $filters['audience']),
            )
            ->when(
                $filters['priority'] !== '',
                fn (Builder $query) => $query->where('notifications.priority', $filters['priority']),
            )
            ->orderBy($sortable[$filters['sort']], $filters['direction'])
            ->orderByDesc('notifications.id');
    }

    /**
     * Counts for the stat cards, taken in SQL rather than over the current page.
     *
     * @return array<string, int>
     */
    protected function notificationStats(): array
    {
        $counts = Notification::query()
            ->composedBy($this->notificationSchoolId())
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = ['total' => (int) $counts->sum()];

        foreach (NotificationStatus::cases() as $status) {
            $stats[$status->value] = (int) ($counts[$status->value] ?? 0);
        }

        return $stats;
    }

    /**
     * One display-ready list row.
     *
     * Row-level URLs are generated here rather than on the client so the same
     * React component serves the platform and school modules without knowing
     * which route set it is looking at.
     *
     * @return array<string, mixed>
     */
    protected function mapNotification(Notification $notification): array
    {
        $timeline = $notification->timelineDate();

        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'body' => $notification->body,
            'excerpt' => $notification->excerpt(),

            'category' => $notification->category->label(),
            'category_value' => $notification->category->value,

            'priority' => $notification->priority->label(),
            'priority_value' => $notification->priority->value,
            'priority_elevated' => $notification->priority->isElevated(),

            'audience_label' => $notification->audience_label,
            'audience_type' => $notification->audience_type->value,
            'audience_ids' => $notification->audienceIds(),

            'channel_label' => $notification->channelLabel(),
            'sends_email' => $notification->sendsEmail(),

            'action_label' => $notification->action_label,
            'action_url' => $notification->action_url,

            'status' => $notification->status->label(),
            'status_value' => $notification->status->value,
            'is_editable' => $notification->isEditable(),
            'is_sendable' => $notification->isSendable(),
            'is_archived' => $notification->status === NotificationStatus::Archived,

            'date_label' => $timeline->format('Y-m-d'),
            'date_relative' => $timeline->diffForHumans(),
            'scheduled_at' => $notification->scheduled_at?->format('Y-m-d\TH:i'),
            'sent_label' => $notification->sent_at?->format('M j, Y g:ia'),

            'recipients_count' => (int) $notification->recipients_count,
            'read_count' => (int) ($notification->read_count ?? 0),

            'sender' => $notification->sender?->name ?? 'System',
            'organization' => $notification->school?->name,

            'show_url' => $this->notificationRoute('show', $notification),
            'update_url' => $this->notificationRoute('update', $notification),
            'send_url' => $this->notificationRoute('send', $notification),
            'archive_url' => $this->notificationRoute('archive', $notification),
            'unarchive_url' => $this->notificationRoute('unarchive', $notification),
            'destroy_url' => $this->notificationRoute('destroy', $notification),
        ];
    }

    /**
     * The read/unread filter on the delivery report.
     */
    protected function readFilter(Request $request): string
    {
        $read = strtolower(trim((string) $request->query('read', '')));

        return in_array($read, ['read', 'unread'], true) ? $read : '';
    }

    /**
     * Who holds a copy, whether they have opened it, and when.
     *
     * Trashed rows are included: a recipient deleting their copy does not undo
     * the fact that it was delivered to them, and the author is entitled to see
     * that. Unread recipients sort first, since they are the actionable ones.
     *
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    protected function recipientReport(Notification $notification, Request $request): LengthAwarePaginator
    {
        $read = $this->readFilter($request);

        return NotificationRecipient::query()
            ->withTrashed()
            ->where('notification_id', $notification->id)
            ->when($read === 'read', fn (Builder $query) => $query->whereNotNull('read_at'))
            ->when($read === 'unread', fn (Builder $query) => $query->whereNull('read_at'))
            ->with('user:id,name,email,avatar,type,school_id')
            ->orderByRaw('read_at is null desc')
            ->orderByDesc('read_at')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (NotificationRecipient $receipt): array => [
                'id' => $receipt->id,
                'name' => $receipt->user?->name ?? 'Deleted account',
                'email' => $receipt->user?->email ?? '—',
                'initials' => $receipt->user?->initials() ?? '?',
                'avatar_url' => $receipt->user?->avatarUrl(),
                'type' => $receipt->user?->type->label() ?? '—',
                'read_at_label' => $receipt->read_at?->format('M j, Y g:ia') ?? '—',
                'read_relative' => $receipt->read_at?->diffForHumans(),
                'is_read' => $receipt->isRead(),
                'emailed' => $receipt->emailed_at !== null,
                'removed' => $receipt->trashed(),
            ]);
    }

    /**
     * Everything the announcement builder needs that is not a notification: the
     * option lists, the enum choices, and the endpoints it calls as you type.
     *
     * Users are deliberately absent. There can be thousands, so the picker
     * searches for them through `audienceOptions` instead of receiving a list.
     *
     * @return array<string, mixed>
     */
    protected function notificationBuilderOptions(): array
    {
        return [
            'audienceOptions' => NotificationAudience::optionsFor($this->notificationAudienceCases()),
            'categoryOptions' => NotificationCategory::options(),
            'priorityOptions' => NotificationPriority::options(),
            'organizationOptions' => $this->organizationAudienceOptions(),
            'planOptions' => $this->planAudienceOptions(),
            'roleOptions' => $this->roleAudienceOptions(),
        ];
    }

    /**
     * Resolve a set of ids into value/label pairs so an existing draft's picker
     * renders its selection without a round trip.
     *
     * @return array<int, array{value: string, label: string}>
     */
    protected function resolveAudienceSelection(Notification $notification): array
    {
        $ids = $notification->audienceIds();

        if ($ids === []) {
            return [];
        }

        return match ($notification->audience_type->selectionResource()) {
            'organizations' => $this->toOptions(School::query()->whereKey($ids)->orderBy('name')->get(['id', 'name'])),
            'plans' => $this->toOptions(Plan::withTrashed()->whereKey($ids)->orderBy('name')->get(['id', 'name'])),
            'roles' => $this->roleAudienceOptions($ids),
            'users' => $this->userAudienceOptions('', $ids),
            default => [],
        };
    }

    /**
     * Option lists the builder fetches on demand, keyed by the audience mode's
     * `selectionResource()`.
     *
     * Passing `$ids` asks for those specific records instead of a search. The
     * builder needs it when editing: people are found by searching, so a
     * previously chosen name has no label until it is looked up by id.
     *
     * @param  array<int, int>|null  $ids
     * @return array<int, array{value: string, label: string}>
     */
    protected function audienceOptionsFor(string $resource, string $search, ?array $ids = null): array
    {
        return match ($resource) {
            'organizations' => $this->organizationAudienceOptions($search),
            'plans' => $this->planAudienceOptions(),
            'roles' => $this->roleAudienceOptions($ids, $search),
            'users' => $this->userAudienceOptions($search, $ids),
            default => [],
        };
    }

    /**
     * The ids an options request is asking to have resolved, if any.
     *
     * @return array<int, int>|null
     */
    protected function requestedOptionIds(Request $request): ?array
    {
        $ids = $request->query('ids');

        if (! is_array($ids) || $ids === []) {
            return null;
        }

        return array_values(array_filter(
            array_map(fn (mixed $id): int => (int) $id, $ids),
            fn (int $id): bool => $id > 0,
        ));
    }

    /**
     * Estimate the reach of an audience, and the label it would be stored with.
     *
     * @return array{count: int, label: string}
     */
    protected function estimateAudience(Request $request): array
    {
        $selection = AudienceSelection::make(
            NotificationAudience::tryFrom((string) $request->query('audience_type')) ?? NotificationAudience::AllUsers,
            (array) $request->query('ids', []),
            $this->notificationSchoolId(),
        );

        $resolver = app(AudienceResolver::class);

        return [
            'count' => $resolver->count($selection),
            'label' => $resolver->describe($selection),
        ];
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function organizationAudienceOptions(string $search = ''): array
    {
        $schoolId = $this->notificationSchoolId();

        return $this->toOptions(
            School::query()
                ->when($schoolId !== null, fn (Builder $query) => $query->whereKey($schoolId))
                ->when($search !== '', fn (Builder $query) => $query->where('name', 'like', '%'.$search.'%'))
                ->orderBy('name')
                ->limit(100)
                ->get(['id', 'name']),
        );
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function planAudienceOptions(): array
    {
        return $this->toOptions(
            Plan::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'name']),
        );
    }

    /**
     * Roles, addressed by id because names repeat once per organization.
     *
     * Platform roles are prefixed with "Platform" and school roles with their
     * organization, so "Admin" appearing five times in the picker is
     * distinguishable.
     *
     * @param  array<int, int>|null  $ids
     * @return array<int, array{value: string, label: string}>
     */
    private function roleAudienceOptions(?array $ids = null, string $search = ''): array
    {
        $schoolId = $this->notificationSchoolId();
        $schoolNames = School::query()->pluck('name', 'id');

        return Role::query()
            ->when($ids !== null, fn (Builder $query) => $query->whereKey($ids))
            ->when($schoolId !== null, fn (Builder $query) => $query->where('school_id', $schoolId))
            ->when($search !== '', fn (Builder $query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('school_id')
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name', 'school_id'])
            ->map(fn (Role $role): array => [
                'value' => (string) $role->id,
                'label' => ($schoolNames[$role->school_id] ?? 'Platform').' · '.Str::headline($role->name),
            ])
            ->all();
    }

    /**
     * People, searched rather than listed. Disabled accounts are excluded because
     * AudienceResolver would drop them anyway.
     *
     * @param  array<int, int>|null  $ids
     * @return array<int, array{value: string, label: string}>
     */
    private function userAudienceOptions(string $search = '', ?array $ids = null): array
    {
        $schoolId = $this->notificationSchoolId();

        return User::query()
            ->when($ids !== null, fn (Builder $query) => $query->whereKey($ids))
            ->when($schoolId !== null, fn (Builder $query) => $query->where('school_id', $schoolId))
            ->when(
                $search !== '',
                fn (Builder $query) => $query->where(function (Builder $builder) use ($search): void {
                    $term = '%'.$search.'%';

                    $builder->where('name', 'like', $term)->orWhere('email', 'like', $term);
                }),
            )
            ->orderBy('name')
            ->limit(25)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user): array => [
                'value' => (string) $user->id,
                'label' => $user->name.' · '.$user->email,
            ])
            ->all();
    }

    /**
     * @param  Collection<int, Model>  $models
     * @return array<int, array{value: string, label: string}>
     */
    private function toOptions($models): array
    {
        return $models
            ->map(fn ($model): array => [
                'value' => (string) $model->getKey(),
                'label' => (string) $model->name,
            ])
            ->values()
            ->all();
    }
}
