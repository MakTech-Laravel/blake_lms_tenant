<?php

namespace App\Http\Controllers\Platform;

use App\Enums\NotificationAudience;
use App\Enums\NotificationStatus;
use App\Exports\NotificationsExport;
use App\Http\Controllers\Concerns\BuildsNotificationIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\StoreNotificationRequest;
use App\Http\Requests\Notification\UpdateNotificationRequest;
use App\Models\Notification;
use App\Support\Notifications\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Platform authoring of announcements: the Notifications & Announcements module.
 *
 * This is the composer's side of the system. What a recipient sees, and their own
 * read state, belongs to NotificationInboxController — the platform staff member
 * writing an announcement also has a personal inbox, and they are different
 * screens with different permissions.
 */
class NotificationController extends Controller
{
    use BuildsNotificationIndex;

    public function __construct(private readonly Notifier $notifier) {}

    public function index(Request $request): Response
    {
        $filters = $this->resolveNotificationFilters($request);

        $notifications = $this->notificationsQuery($filters)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Notification $notification): array => $this->mapNotification($notification));

        return Inertia::render('platform/notifications/index', [
            'notifications' => $notifications,
            'filters' => $filters,
            'stats' => $this->notificationStats(),
            'routes' => $this->moduleRoutes(),
            ...$this->notificationBuilderOptions(),
        ]);
    }

    /**
     * Delivery report: who holds a copy, who has opened it, and when.
     */
    public function show(Request $request, Notification $notification): Response
    {
        $this->assertPlatformComposed($notification);

        $notification->load(['sender:id,name']);
        $notification->loadCount(['receipts as read_count' => fn ($query) => $query
            ->withTrashed()
            ->whereNotNull('read_at')]);

        return Inertia::render('platform/notifications/show', [
            'notification' => $this->mapNotification($notification),
            'audienceSelection' => $this->resolveAudienceSelection($notification),
            'recipients' => $this->recipientReport($notification, $request),
            'filters' => ['read' => $this->readFilter($request)],
            'routes' => $this->moduleRoutes(),
        ]);
    }

    /**
     * Save a draft, schedule it, or send it now. Which of the three is the
     * builder's `intent`, not something inferred from the payload.
     */
    public function store(StoreNotificationRequest $request): RedirectResponse
    {
        $message = $request->toNotificationMessage();
        $audience = $request->toAudienceSelection();

        $notification = match ($request->intent()) {
            'send' => $this->notifier->send($message, $audience, $request->user()),
            'schedule' => $this->notifier->schedule($message, $audience, $request->scheduledFor(), $request->user()),
            default => $this->notifier->draft($message, $audience, $request->user()),
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->confirmationFor($notification, $request->intent()),
        ]);

        return redirect()->route('platform.notifications.index');
    }

    /**
     * Rewrite an announcement that has not gone out yet, optionally sending it in
     * the same action.
     */
    public function update(UpdateNotificationRequest $request, Notification $notification): RedirectResponse
    {
        $this->assertPlatformComposed($notification);

        if (! $notification->isEditable()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This announcement has already been delivered, so it can no longer be edited.',
            ]);

            return redirect()->back();
        }

        $this->notifier->revise(
            $notification,
            $request->toNotificationMessage(),
            $request->toAudienceSelection(),
            $request->scheduledFor(),
        );

        if ($request->intent() === 'send') {
            $this->notifier->dispatch($notification->refresh());
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->confirmationFor($notification->refresh(), $request->intent()),
        ]);

        return redirect()->back();
    }

    /**
     * Send a draft or a scheduled announcement immediately.
     */
    public function send(Notification $notification): RedirectResponse
    {
        $this->assertPlatformComposed($notification);

        if (! $notification->isSendable()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This announcement is '.strtolower($notification->status->label()).', so there is nothing to send.',
            ]);

            return redirect()->back();
        }

        $this->notifier->dispatch($notification);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $notification->title.' is on its way to '.$notification->audience_label.'.',
        ]);

        return redirect()->back();
    }

    /**
     * Retire an announcement from the working list without deleting it.
     */
    public function archive(Notification $notification): RedirectResponse
    {
        $this->assertPlatformComposed($notification);

        $notification->update(['status' => NotificationStatus::Archived]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' archived.']);

        return redirect()->back();
    }

    /**
     * Bring it back. A delivered announcement returns to Sent; anything else
     * returns to Draft, since there is nothing to claim it was sent.
     */
    public function unarchive(Notification $notification): RedirectResponse
    {
        $this->assertPlatformComposed($notification);

        $notification->update([
            'status' => $notification->sent_at !== null
                ? NotificationStatus::Sent
                : NotificationStatus::Draft,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' restored.']);

        return redirect()->back();
    }

    /**
     * Discard the announcement.
     *
     * Soft deleted, which also hides it from every recipient's inbox because that
     * relation resolves through the notification. Recipient rows are kept so the
     * delete stays reversible.
     */
    public function destroy(Notification $notification): RedirectResponse
    {
        $this->assertPlatformComposed($notification);

        $notification->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' deleted.']);

        return redirect()->back();
    }

    /**
     * Export the current filters as CSV or Excel.
     */
    public function export(Request $request): BinaryFileResponse
    {
        $filters = $this->resolveNotificationFilters($request);
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';

        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(
            new NotificationsExport($this->notificationsQuery($filters)),
            'notifications-'.now()->format('Y-m-d').'.'.$format,
            $writerType,
        );
    }

    /**
     * Options for the audience picker, fetched as the author types rather than
     * shipped with the page: there can be thousands of people to choose from.
     */
    public function audienceOptions(Request $request): JsonResponse
    {
        $resource = (string) $request->query('resource', '');
        $search = trim((string) $request->query('q', ''));

        return response()->json([
            'options' => $this->audienceOptionsFor($resource, $search, $this->requestedOptionIds($request)),
        ]);
    }

    /**
     * How many people the audience currently selected in the builder reaches.
     */
    public function estimate(Request $request): JsonResponse
    {
        return response()->json($this->estimateAudience($request));
    }

    /**
     * Platform staff manage platform announcements. A school's own announcement
     * belongs to that school's module, and is not reachable from here.
     */
    private function assertPlatformComposed(Notification $notification): void
    {
        abort_if($notification->school_id !== null, 404);
    }

    private function confirmationFor(Notification $notification, string $intent): string
    {
        return match ($intent) {
            'send' => $notification->title.' is on its way to '.$notification->audience_label.'.',
            'schedule' => $notification->title.' is scheduled for '
                .($notification->scheduled_at?->format('M j, Y \a\t g:ia') ?? 'later').'.',
            default => $notification->title.' saved as a draft.',
        };
    }

    protected function notificationSchoolId(): ?int
    {
        return null;
    }

    /**
     * @return array<int, NotificationAudience>
     */
    protected function notificationAudienceCases(): array
    {
        return NotificationAudience::platformCases();
    }

    protected function notificationRoute(string $action, ?Notification $notification = null): string
    {
        return $notification === null
            ? route('platform.notifications.'.$action)
            : route('platform.notifications.'.$action, $notification);
    }

    /**
     * The module-level endpoints the page needs, so the React components do not
     * have to know whether they are rendering the platform or school variant.
     *
     * @return array<string, string>
     */
    private function moduleRoutes(): array
    {
        return [
            'index' => route('platform.notifications.index'),
            'store' => route('platform.notifications.store'),
            'export' => route('platform.notifications.export'),
            'audience_options' => route('platform.notifications.audience_options'),
            'estimate' => route('platform.notifications.estimate'),
        ];
    }
}
