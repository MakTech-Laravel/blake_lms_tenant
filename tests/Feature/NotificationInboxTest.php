<?php

use App\Enums\NotificationPriority;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // These render real Inertia pages, and the root view asks Vite for the page
    // component. Without this the suite would only pass on a machine that had
    // just built the frontend.
    $this->withoutVite();
});

/**
 * Deliver an announcement to the given people, as the fan-out job would.
 *
 * @param  array<int, User>  $recipients
 */
function deliverTo(Notification $notification, array $recipients): Notification
{
    foreach ($recipients as $recipient) {
        $notification->receipts()->create(['user_id' => $recipient->id]);
    }

    $notification->update(['recipients_count' => count($recipients)]);

    return $notification;
}

test('the inbox wraps itself in the account\'s home portal shell', function () {
    // The personal inbox is a shared route, outside every portal prefix. The
    // frontend picks Platform / School / Teacher chrome from this prop so
    // "View all notifications" never drops into the starter-kit layout.
    $this->actingAs(platformSuperAdmin())
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('shell', 'platform'));

    $school = School::factory()->create();
    $staff = schoolSuperAdmin($school);

    $this->actingAs($staff)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('shell', 'school')
            ->where('school.slug', $school->slug)
        );

    $this->actingAs(User::factory()->teacher()->create())
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('shell', 'teacher'));
});

test('the inbox shows the notifications a user holds and nobody else', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    deliverTo(Notification::factory()->sent()->create(['title' => 'Mine']), [$user]);
    deliverTo(Notification::factory()->sent()->create(['title' => 'Theirs']), [$other]);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Mine')
            ->where('stats.unread', 1)
        );
});

test('a teacher has the same inbox as anybody else', function () {
    $teacher = User::factory()->teacher()->create();

    deliverTo(Notification::factory()->sent()->create(['title' => 'Pool closure']), [$teacher]);

    $this->actingAs($teacher)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('notifications.data.0.title', 'Pool closure'));

    // The teacher portal's own entry lands in the same place.
    $this->actingAs($teacher)
        ->get(route('teacher.notifications.index'))
        ->assertRedirect(route('notifications.index'));
});

test('urgent notifications lead the inbox even when something newer arrived', function () {
    $user = User::factory()->create();

    deliverTo(Notification::factory()->sent()->create(['title' => 'Routine update']), [$user]);
    deliverTo(
        Notification::factory()->sent()->priority(NotificationPriority::Urgent)->create(['title' => 'Act now']),
        [$user],
    );

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page->where('notifications.data.0.title', 'Act now'));
});

test('a notification can be marked read and unread again', function () {
    $user = User::factory()->create();
    $notification = deliverTo(Notification::factory()->sent()->create(), [$user]);

    expect($user->unreadNotificationCount())->toBe(1);

    $this->actingAs($user)
        ->patch(route('notifications.read', $notification))
        ->assertRedirect();

    expect($user->refresh()->unreadNotificationCount())->toBe(0);

    $this->actingAs($user)
        ->patch(route('notifications.unread', $notification))
        ->assertRedirect();

    expect($user->refresh()->unreadNotificationCount())->toBe(1);
});

test('the first open is the read time that is kept', function () {
    $user = User::factory()->create();
    $notification = deliverTo(Notification::factory()->sent()->create(), [$user]);

    $this->travelTo(now()->subHour());
    $this->actingAs($user)->patch(route('notifications.read', $notification));
    $firstOpen = $user->notificationReceipt($notification)->read_at;

    $this->travelBack();
    $this->actingAs($user)->patch(route('notifications.read', $notification));

    expect($user->notificationReceipt($notification)->read_at->toDateTimeString())
        ->toBe($firstOpen->toDateTimeString());
});

test('mark all read clears the badge in one action', function () {
    $user = User::factory()->create();

    foreach (range(1, 3) as $ignored) {
        deliverTo(Notification::factory()->sent()->create(), [$user]);
    }

    expect($user->unreadNotificationCount())->toBe(3);

    $this->actingAs($user)
        ->patch(route('notifications.read_all'))
        ->assertRedirect();

    expect($user->refresh()->unreadNotificationCount())->toBe(0);
});

test('mark all read reaches exactly what the badge was counting', function () {
    $user = User::factory()->create();

    $inbox = deliverTo(Notification::factory()->sent()->create(), [$user]);

    // Filed away and then deliberately flagged unread again. The badge ignores
    // archived copies, so clearing the badge must leave this one alone.
    $archived = deliverTo(Notification::factory()->sent()->create(), [$user]);
    $user->archiveNotification($archived);
    $user->markNotificationUnread($archived);

    expect($user->unreadNotificationCount())->toBe(1);
    expect($user->markAllNotificationsRead())->toBe(1);

    expect($user->notificationReceipt($inbox)->read_at)->not->toBeNull();
    expect($user->notificationReceipt($archived)->read_at)->toBeNull();
});

test('archiving moves a notification out of the inbox and stops it counting', function () {
    $user = User::factory()->create();
    $notification = deliverTo(Notification::factory()->sent()->create(['title' => 'Filed away']), [$user]);

    $this->actingAs($user)
        ->patch(route('notifications.archive', $notification))
        ->assertRedirect();

    expect($user->refresh()->unreadNotificationCount())->toBe(0);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 0)
            ->where('stats.archived', 1)
        );

    $this->actingAs($user)
        ->get(route('notifications.index', ['tab' => 'archived']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Filed away')
        );

    $this->actingAs($user)
        ->patch(route('notifications.unarchive', $notification))
        ->assertRedirect();

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page->has('notifications.data', 1));
});

test('the unread tab shows only what has not been opened', function () {
    $user = User::factory()->create();

    $read = deliverTo(Notification::factory()->sent()->create(['title' => 'Seen it']), [$user]);
    deliverTo(Notification::factory()->sent()->create(['title' => 'Not yet']), [$user]);

    $user->markNotificationRead($read);

    $this->actingAs($user)
        ->get(route('notifications.index', ['tab' => 'unread']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Not yet')
        );
});

test('the inbox can be searched', function () {
    $user = User::factory()->create();

    deliverTo(Notification::factory()->sent()->create(['title' => 'Certificate renewal due']), [$user]);
    deliverTo(Notification::factory()->sent()->create(['title' => 'New pathway published']), [$user]);

    $this->actingAs($user)
        ->get(route('notifications.index', ['search' => 'certificate']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Certificate renewal due')
        );
});

test('one recipient deleting a notification leaves every other copy intact', function () {
    $leaving = User::factory()->create();
    $staying = User::factory()->create();

    $notification = deliverTo(
        Notification::factory()->sent(2)->create(['title' => 'Shared announcement']),
        [$leaving, $staying],
    );

    $this->actingAs($leaving)
        ->delete(route('notifications.destroy', $notification))
        ->assertRedirect();

    // Gone for the person who removed it.
    expect($leaving->refresh()->appNotifications()->count())->toBe(0)
        // Untouched for everybody else.
        ->and($staying->refresh()->appNotifications()->count())->toBe(1)
        ->and($staying->unreadNotificationCount())->toBe(1)
        // And the announcement itself is not deleted.
        ->and(Notification::query()->whereKey($notification->id)->exists())->toBeTrue()
        // The receipt is soft deleted, so the author's report still shows the
        // announcement was delivered to them.
        ->and(NotificationRecipient::withTrashed()->where('notification_id', $notification->id)->count())->toBe(2);
});

test('a user cannot act on a notification that was never delivered to them', function () {
    $outsider = User::factory()->create();
    $recipient = User::factory()->create();

    $notification = deliverTo(Notification::factory()->sent()->create(), [$recipient]);

    $this->actingAs($outsider)->patch(route('notifications.read', $notification))->assertNotFound();
    $this->actingAs($outsider)->patch(route('notifications.archive', $notification))->assertNotFound();
    $this->actingAs($outsider)->delete(route('notifications.destroy', $notification))->assertNotFound();

    expect($recipient->unreadNotificationCount())->toBe(1);
});

test('a deleted copy cannot be acted on again', function () {
    $user = User::factory()->create();
    $notification = deliverTo(Notification::factory()->sent()->create(), [$user]);

    $user->forgetNotification($notification);

    $this->actingAs($user)->patch(route('notifications.read', $notification))->assertNotFound();
});

test('an announcement the author deleted disappears from every inbox', function () {
    $user = User::factory()->create();
    $notification = deliverTo(Notification::factory()->sent()->create(), [$user]);

    $notification->delete();

    expect($user->unreadNotificationCount())->toBe(0);

    $this->actingAs($user)
        ->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 0)
            ->where('stats.total', 0)
        );
});

test('the bell feed returns the recent notifications and the unread count', function () {
    $user = User::factory()->create();

    deliverTo(Notification::factory()->sent()->create(['title' => 'In the bell']), [$user]);
    $archived = deliverTo(Notification::factory()->sent()->create(['title' => 'Filed']), [$user]);
    $user->archiveNotification($archived);

    $this->actingAs($user)
        ->getJson(route('notifications.recent'))
        ->assertOk()
        ->assertJsonCount(1, 'items')
        ->assertJsonPath('items.0.title', 'In the bell')
        ->assertJsonPath('unread_count', 1);
});

test('the unread count is shared with every page so the bell is right on first paint', function () {
    $school = School::factory()->create();
    $user = schoolSuperAdmin($school);

    deliverTo(Notification::factory()->sent()->create(), [$user]);

    $this->actingAs($user)
        ->get(route('school.dashboard', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('notifications.unread_count', 1));
});

test('the inbox costs the same number of queries however many rows it shows', function () {
    $user = User::factory()->create();
    $schools = School::factory()->count(6)->create();

    // Each from a different organization, so a lazily loaded sender would show
    // up as one query per row rather than being masked by Eloquent's identity map.
    foreach ($schools as $school) {
        deliverTo(Notification::factory()->forSchool($school)->sent()->create(), [$user]);
    }

    $queries = 0;
    DB::listen(function () use (&$queries): void {
        $queries++;
    });

    $this->actingAs($user)->get(route('notifications.index'))->assertOk();

    $withSix = $queries;

    foreach (School::factory()->count(6)->create() as $school) {
        deliverTo(Notification::factory()->forSchool($school)->sent()->create(), [$user]);
    }

    $queries = 0;
    $this->actingAs($user)->get(route('notifications.index'))->assertOk();

    expect($queries)->toBe($withSix);
});

test('the inbox needs no permission at all', function () {
    // A bare account holds no roles and no permissions, and must still be able
    // to read what it was sent.
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('notifications.index'))->assertOk();
    $this->actingAs($user)->getJson(route('notifications.recent'))->assertOk();
    $this->actingAs($user)->patch(route('notifications.read_all'))->assertRedirect();
});

test('the inbox requires signing in', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
});
