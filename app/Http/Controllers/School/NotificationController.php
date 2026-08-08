<?php

namespace App\Http\Controllers\School;

use App\Enums\NotificationAudience;
use App\Enums\NotificationStatus;
use App\Exports\NotificationsExport;
use App\Http\Controllers\Concerns\BuildsNotificationIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\StoreSchoolNotificationRequest;
use App\Http\Requests\Notification\UpdateSchoolNotificationRequest;
use App\Models\Notification;
use App\Models\School;
use App\Support\Notifications\Notifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * A school's own announcements to its staff and teachers.
 *
 * The same screen as the platform module, scoped two ways: the list only shows
 * announcements this school authored, and every audience is clamped to this
 * school's people by AudienceSelection, so no targeting choice can reach another
 * organization.
 *
 * The tenant is resolved by the `tenant` middleware, which also sets Spatie's
 * active team, so the role picker naturally offers this school's roles only.
 */
class NotificationController extends Controller
{
    use BuildsNotificationIndex;

    /**
     * The tenant for the current request, set once per action so the shared
     * concern can scope its queries without re-resolving the route binding.
     */
    private ?School $school = null;

    public function __construct(private readonly Notifier $notifier) {}

    public function index(Request $request, School $school): Response
    {
        $this->school = $school;

        $filters = $this->resolveNotificationFilters($request);

        $notifications = $this->notificationsQuery($filters)
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Notification $notification): array => $this->mapNotification($notification));

        return Inertia::render('school/notifications/index', [
            'notifications' => $notifications,
            'filters' => $filters,
            'stats' => $this->notificationStats(),
            'routes' => $this->moduleRoutes(),
            ...$this->notificationBuilderOptions(),
        ]);
    }

    /**
     * Delivery report for one of this school's announcements.
     */
    public function show(Request $request, School $school, Notification $notification): Response
    {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

        $notification->load(['sender:id,name']);
        $notification->loadCount(['receipts as read_count' => fn ($query) => $query
            ->withTrashed()
            ->whereNotNull('read_at')]);

        return Inertia::render('school/notifications/show', [
            'notification' => $this->mapNotification($notification),
            'audienceSelection' => $this->resolveAudienceSelection($notification),
            'recipients' => $this->recipientReport($notification, $request),
            'filters' => ['read' => $this->readFilter($request)],
            'routes' => $this->moduleRoutes(),
        ]);
    }

    public function store(StoreSchoolNotificationRequest $request, School $school): RedirectResponse
    {
        $this->school = $school;

        $message = $request->toNotificationMessage();
        $audience = $request->toAudienceSelection($school->id);

        $notification = match ($request->intent()) {
            'send' => $this->notifier->send($message, $audience, $request->user()),
            'schedule' => $this->notifier->schedule($message, $audience, $request->scheduledFor(), $request->user()),
            default => $this->notifier->draft($message, $audience, $request->user()),
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $this->confirmationFor($notification, $request->intent()),
        ]);

        return redirect()->route('school.notifications.index', $school);
    }

    public function update(
        UpdateSchoolNotificationRequest $request,
        School $school,
        Notification $notification,
    ): RedirectResponse {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

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
            $request->toAudienceSelection($school->id),
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

    public function send(School $school, Notification $notification): RedirectResponse
    {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

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

    public function archive(School $school, Notification $notification): RedirectResponse
    {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

        $notification->update(['status' => NotificationStatus::Archived]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' archived.']);

        return redirect()->back();
    }

    public function unarchive(School $school, Notification $notification): RedirectResponse
    {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

        $notification->update([
            'status' => $notification->sent_at !== null
                ? NotificationStatus::Sent
                : NotificationStatus::Draft,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' restored.']);

        return redirect()->back();
    }

    public function destroy(School $school, Notification $notification): RedirectResponse
    {
        $this->school = $school;
        $this->assertOwnedBy($school, $notification);

        $notification->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => $notification->title.' deleted.']);

        return redirect()->back();
    }

    public function export(Request $request, School $school): BinaryFileResponse
    {
        $this->school = $school;

        $filters = $this->resolveNotificationFilters($request);
        $format = $request->query('format') === 'csv' ? 'csv' : 'xlsx';

        $writerType = $format === 'csv'
            ? \Maatwebsite\Excel\Excel::CSV
            : \Maatwebsite\Excel\Excel::XLSX;

        return Excel::download(
            new NotificationsExport($this->notificationsQuery($filters)),
            $school->slug.'-notifications-'.now()->format('Y-m-d').'.'.$format,
            $writerType,
        );
    }

    public function audienceOptions(Request $request, School $school): JsonResponse
    {
        $this->school = $school;

        return response()->json([
            'options' => $this->audienceOptionsFor(
                (string) $request->query('resource', ''),
                trim((string) $request->query('q', '')),
                $this->requestedOptionIds($request),
            ),
        ]);
    }

    public function estimate(Request $request, School $school): JsonResponse
    {
        $this->school = $school;

        return response()->json($this->estimateAudience($request));
    }

    /**
     * Another organization's announcement is not reachable from this dashboard,
     * and neither is a platform one.
     */
    private function assertOwnedBy(School $school, Notification $notification): void
    {
        abort_if($notification->school_id !== $school->id, 404);
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
        return $this->school?->id;
    }

    /**
     * @return array<int, NotificationAudience>
     */
    protected function notificationAudienceCases(): array
    {
        return NotificationAudience::schoolCases();
    }

    protected function notificationRoute(string $action, ?Notification $notification = null): string
    {
        $parameters = $notification === null
            ? [$this->school]
            : [$this->school, $notification];

        return route('school.notifications.'.$action, $parameters);
    }

    /**
     * @return array<string, string>
     */
    private function moduleRoutes(): array
    {
        return [
            'index' => route('school.notifications.index', $this->school),
            'store' => route('school.notifications.store', $this->school),
            'export' => route('school.notifications.export', $this->school),
            'audience_options' => route('school.notifications.audience_options', $this->school),
            'estimate' => route('school.notifications.estimate', $this->school),
        ];
    }
}
