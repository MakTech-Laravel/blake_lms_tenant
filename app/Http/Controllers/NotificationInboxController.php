<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A signed-in user's own notification inbox, whichever portal they belong to.
 *
 * Deliberately ungated: every account owns its inbox, and there is no permission
 * that would make sense to require. The scoping is the authenticated user, not a
 * role — every query here runs through the user's own receipts, so one account
 * can never touch another's read state or delete another's copy.
 *
 * Distinct from the Platform and School notification controllers, which are the
 * authoring side. A platform admin has both: a management screen and an inbox.
 */
class NotificationInboxController extends Controller
{
    /**
     * The inbox tabs. "All" is the absence of a filter.
     *
     * @var array<int, string>
     */
    private const TABS = ['unread', 'archived'];

    public function index(Request $request): Response
    {
        $user = $request->user();

        $tab = in_array($request->query('tab'), self::TABS, true)
            ? (string) $request->query('tab')
            : 'all';

        $search = trim((string) $request->query('search', ''));

        $notifications = $this->inboxQuery($request, $tab, $search)
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Notification $notification): array => $this->mapInboxRow($notification));

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'filters' => ['tab' => $tab, 'search' => $search],
            'stats' => [
                'total' => $user->notificationReceipts()->inbox()->whereHas('notification')->count(),
                'unread' => $user->unreadNotificationCount(),
                'archived' => $user->notificationReceipts()->archived()->whereHas('notification')->count(),
            ],
            // Which AquaCert shell to wrap this shared page in. Resolved from the
            // account type because `/notifications` sits outside every portal
            // prefix and would otherwise fall through to the starter-kit layout.
            'shell' => $this->shellFor($user),
        ]);
    }

    /**
     * The dashboard shell that matches this account's home portal.
     */
    private function shellFor(User $user): string
    {
        return match (true) {
            $user->isPlatformStaff() => 'platform',
            $user->isSchoolStaff() => 'school',
            default => 'teacher',
        };
    }

    /**
     * The header bell's feed, fetched when the popover opens so no page pays for
     * it up front. The badge count itself is a shared Inertia prop.
     */
    public function recent(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = $user->appNotifications()
            ->with('school:id,name')
            ->wherePivotNull('archived_at')
            ->orderByPivot('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn (Notification $notification): array => $this->mapInboxRow($notification))
            ->all();

        return response()->json([
            'items' => $items,
            'unread_count' => $user->unreadNotificationCount(),
        ]);
    }

    public function read(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->markNotificationRead($notification), 404);

        return redirect()->back();
    }

    public function unread(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->markNotificationUnread($notification), 404);

        return redirect()->back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $cleared = $request->user()->markAllNotificationsRead();

        if ($cleared > 0) {
            Inertia::flash('toast', [
                'type' => 'success',
                'message' => $cleared === 1 ? '1 notification marked as read.' : $cleared.' notifications marked as read.',
            ]);
        }

        return redirect()->back();
    }

    public function archive(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->archiveNotification($notification), 404);

        return redirect()->back();
    }

    public function unarchive(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->unarchiveNotification($notification), 404);

        return redirect()->back();
    }

    /**
     * Remove this user's copy. The announcement and every other recipient's copy
     * are untouched, which is why the delete lives on the pivot.
     */
    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($request->user()->forgetNotification($notification), 404);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Removed from your notifications.',
        ]);

        return redirect()->back();
    }

    /**
     * @return BelongsToMany<Notification, User>
     */
    private function inboxQuery(Request $request, string $tab, string $search): BelongsToMany
    {
        // Built with statements rather than a `when()` chain: `when()` is not
        // defined on the relation, so it forwards to the underlying Eloquent
        // builder and the pivot helpers below would no longer be available.
        // The sender name on every row comes from the school, so it is loaded
        // with the page rather than one query per row.
        $query = $request->user()->appNotifications()->with('school:id,name');

        if ($tab === 'archived') {
            $query->wherePivotNotNull('archived_at');
        } else {
            $query->wherePivotNull('archived_at');
        }

        if ($tab === 'unread') {
            $query->wherePivotNull('read_at');
        }

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $term = '%'.$search.'%';

                $builder->where('notifications.title', 'like', $term)
                    ->orWhere('notifications.body', 'like', $term);
            });
        }

        // Urgent items lead, then most recent, so a critical announcement is not
        // buried under routine ones sent after it.
        return $query
            ->orderByRaw("case notifications.priority when 'urgent' then 0 when 'high' then 1 else 2 end")
            ->orderByPivot('created_at', 'desc')
            ->orderByDesc('notifications.id');
    }

    /**
     * One inbox row, shared by the page and the bell so both render identically.
     *
     * @return array<string, mixed>
     */
    private function mapInboxRow(Notification $notification): array
    {
        /** @var NotificationRecipient $receipt */
        $receipt = $notification->getRelation('pivot');

        $received = $receipt->created_at ?? $notification->created_at;

        return [
            'id' => $notification->id,
            'title' => $notification->title,
            'body' => $notification->body,
            'excerpt' => $notification->excerpt(160),

            'category' => $notification->category->label(),
            'category_value' => $notification->category->value,

            'priority' => $notification->priority->label(),
            'priority_value' => $notification->priority->value,
            'priority_elevated' => $notification->priority->isElevated(),

            'action_label' => $notification->action_label,
            'action_url' => $notification->action_url,

            'sender' => $notification->school?->name ?? config('app.name'),

            'is_read' => $receipt->read_at !== null,
            'is_archived' => $receipt->archived_at !== null,
            'read_at_label' => $receipt->read_at?->format('M j, Y g:ia'),

            'received_label' => $received->format('M j, Y g:ia'),
            'received_relative' => $received->diffForHumans(),

            'read_url' => route('notifications.read', $notification),
            'unread_url' => route('notifications.unread', $notification),
            'archive_url' => route('notifications.archive', $notification),
            'unarchive_url' => route('notifications.unarchive', $notification),
            'destroy_url' => route('notifications.destroy', $notification),
        ];
    }
}
