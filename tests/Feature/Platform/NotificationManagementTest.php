<?php

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Enums\PermissionEnum;
use App\Models\Notification;
use App\Models\Plan;
use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // These render real Inertia pages, and the root view asks Vite for the page
    // component. Without this the suite would only pass on a machine that had
    // just built the frontend.
    $this->withoutVite();
});

/**
 * Valid announcement payload, overridable per test.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function announcementPayload(array $overrides = []): array
{
    return [
        'title' => 'Scheduled maintenance this weekend',
        'body' => 'The platform will be briefly unavailable on Saturday morning.',
        'category' => NotificationCategory::SystemAlert->value,
        'priority' => NotificationPriority::High->value,
        'action_label' => null,
        'action_url' => null,
        'send_email' => false,
        'audience_type' => NotificationAudience::AllUsers->value,
        'school_ids' => [],
        'plan_ids' => [],
        'role_ids' => [],
        'user_ids' => [],
        'intent' => 'draft',
        'scheduled_at' => null,
        ...$overrides,
    ];
}

test('the announcement list renders with its stats and builder options', function () {
    Notification::factory()->count(2)->create();
    Notification::factory()->sent(12)->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/notifications/index')
            ->has('notifications.data', 3)
            ->where('stats.total', 3)
            ->where('stats.draft', 2)
            ->where('stats.sent', 1)
            ->has('audienceOptions')
            ->has('categoryOptions')
            ->has('priorityOptions')
            ->where('filters.sort', 'date')
            ->where('filters.direction', 'desc')
        );
});

test('a school-composed announcement never appears in the platform list', function () {
    $school = School::factory()->create();
    Notification::factory()->forSchool($school)->create();
    Notification::factory()->create(['title' => 'Platform only']);

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Platform only')
        );
});

test('the status tabs, search, and filters narrow the list', function () {
    Notification::factory()->create(['title' => 'Winter compliance push']);
    Notification::factory()->sent()->create(['title' => 'Summer release notes']);
    Notification::factory()->archived()->create(['title' => 'Retired notice']);

    $admin = platformSuperAdmin();

    $this->actingAs($admin)
        ->get(route('platform.notifications.index', ['status' => 'sent']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Summer release notes')
        );

    $this->actingAs($admin)
        ->get(route('platform.notifications.index', ['search' => 'compliance']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Winter compliance push')
        );

    $this->actingAs($admin)
        ->get(route('platform.notifications.index', ['audience' => NotificationAudience::AllUsers->value]))
        ->assertInertia(fn (Assert $page) => $page->has('notifications.data', 3));
});

test('an unrecognised sort falls back to the timeline instead of reaching a raw column', function () {
    Notification::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.notifications.index', ['sort' => 'notifications.id; drop table users', 'direction' => 'sideways']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'date')
            ->where('filters.direction', 'desc')
        );
});

test('an announcement is saved as a draft without reaching anybody', function () {
    User::factory()->count(3)->create();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload())
        ->assertRedirect(route('platform.notifications.index'));

    $notification = Notification::query()->where('title', 'Scheduled maintenance this weekend')->sole();

    expect($notification->status)->toBe(NotificationStatus::Draft)
        ->and($notification->school_id)->toBeNull()
        ->and($notification->recipients_count)->toBe(0)
        ->and($notification->receipts()->count())->toBe(0)
        // The label is resolved at authoring time and stored.
        ->and($notification->audience_label)->toBe('All Users');
});

test('sending an announcement delivers a copy to every addressed user', function () {
    $author = platformSuperAdmin();
    User::factory()->count(3)->create();
    User::factory()->disabled()->create();

    $this->actingAs($author)
        ->post(route('platform.notifications.store'), announcementPayload(['intent' => 'send']))
        ->assertRedirect(route('platform.notifications.index'));

    $notification = Notification::query()->sole();

    // The author counts as a recipient of "All Users"; the disabled account does not.
    expect($notification->status)->toBe(NotificationStatus::Sent)
        ->and($notification->sent_at)->not->toBeNull()
        ->and($notification->recipients_count)->toBe(4)
        ->and($notification->receipts()->count())->toBe(4);
});

test('scheduling stores the time and leaves the announcement unsent', function () {
    $at = now()->addDays(2)->startOfMinute();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'intent' => 'schedule',
            'scheduled_at' => $at->toDateTimeString(),
        ]))
        ->assertRedirect();

    $notification = Notification::query()->sole();

    expect($notification->status)->toBe(NotificationStatus::Scheduled)
        ->and($notification->scheduled_at->toDateTimeString())->toBe($at->toDateTimeString())
        ->and($notification->receipts()->count())->toBe(0);
});

test('a schedule in the past is rejected', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'intent' => 'schedule',
            'scheduled_at' => now()->subHour()->toDateTimeString(),
        ]))
        ->assertSessionHasErrors('scheduled_at');
});

test('the Schedule button requires a time', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'intent' => 'schedule',
            'scheduled_at' => '',
        ]))
        ->assertSessionHasErrors('scheduled_at');
});

test('an audience mode that needs a selection is refused without one', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'audience_type' => NotificationAudience::SelectedOrganizations->value,
            'school_ids' => [],
        ]))
        ->assertSessionHasErrors('school_ids');
});

test('ids belonging to another audience mode are discarded rather than stored', function () {
    $school = School::factory()->create();
    $person = User::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'audience_type' => NotificationAudience::SelectedOrganizations->value,
            'school_ids' => [$school->id],
            // Left over from the author trying the "Individual People" mode first.
            'user_ids' => [$person->id],
        ]))
        ->assertRedirect();

    expect(Notification::query()->sole()->audience)->toBe(['school_ids' => [$school->id]]);
});

test('an action button needs both a label and a destination', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'action_label' => 'Review policy',
            'action_url' => null,
        ]))
        ->assertSessionHasErrors('action_url');

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'action_label' => null,
            'action_url' => 'https://example.test/policy',
        ]))
        ->assertSessionHasErrors('action_label');
});

test('an action button cannot point at a script url', function () {
    // The destination becomes a link in every recipient's inbox, so a scheme
    // that executes rather than navigates would run in their session.
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'action_label' => 'Click here',
            'action_url' => 'javascript:alert(document.cookie)',
        ]))
        ->assertSessionHasErrors('action_url');

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'action_label' => 'Click here',
            'action_url' => 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        ]))
        ->assertSessionHasErrors('action_url');

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), announcementPayload([
            'action_label' => 'Read the policy',
            'action_url' => 'https://example.test/policy',
        ]))
        ->assertSessionHasNoErrors();
});

test('a draft is not held up by a date it left behind', function () {
    // The author picked a time, thought better of it, and hit Save Draft. The
    // server discards the date for a draft, so refusing to accept it would be
    // refusing over a field that is about to be thrown away.
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), [
            'title' => 'Half-written',
            'body' => 'Coming back to this later.',
            'category' => 'announcement',
            'priority' => 'normal',
            'audience_type' => 'all_users',
            'scheduled_at' => now()->subWeek()->format('Y-m-d\TH:i'),
            'intent' => 'draft',
        ])
        ->assertSessionHasNoErrors();

    expect(Notification::firstWhere('title', 'Half-written')->scheduled_at)->toBeNull();
});

test('a scheduled send still has to be in the future', function () {
    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.store'), [
            'title' => 'Backdated',
            'body' => 'Should not be accepted.',
            'category' => 'announcement',
            'priority' => 'normal',
            'audience_type' => 'all_users',
            'scheduled_at' => now()->subWeek()->format('Y-m-d\TH:i'),
            'intent' => 'schedule',
        ])
        ->assertSessionHasErrors('scheduled_at');
});

test('deleting from the delivery report lands somewhere that still exists', function () {
    $notification = Notification::factory()->sent()->create();

    // The report is the announcement's own page, so bouncing back to it after a
    // soft delete would ask route binding for a row it can no longer find.
    $this->actingAs(platformSuperAdmin())
        ->from(route('platform.notifications.show', $notification))
        ->delete(route('platform.notifications.destroy', $notification))
        ->assertRedirect(route('platform.notifications.index'));

    expect($notification->fresh()->trashed())->toBeTrue();
});

test('deleting from the list keeps the filters that were showing', function () {
    $notification = Notification::factory()->create();
    $list = route('platform.notifications.index', ['status' => 'draft', 'page' => 1]);

    $this->actingAs(platformSuperAdmin())
        ->from($list)
        ->delete(route('platform.notifications.destroy', $notification))
        ->assertRedirect($list);
});

test('a draft can be rewritten', function () {
    $notification = Notification::factory()->create(['title' => 'First attempt']);

    $this->actingAs(platformSuperAdmin())
        ->put(route('platform.notifications.update', $notification), announcementPayload([
            'title' => 'Second attempt',
        ]))
        ->assertRedirect();

    expect($notification->refresh()->title)->toBe('Second attempt');
});

test('a delivered announcement can no longer be edited', function () {
    $notification = Notification::factory()->sent(5)->create(['title' => 'Already out']);

    $this->actingAs(platformSuperAdmin())
        ->put(route('platform.notifications.update', $notification), announcementPayload([
            'title' => 'Too late',
        ]))
        ->assertRedirect();

    expect($notification->refresh()->title)->toBe('Already out');
});

test('a draft can be sent from the list', function () {
    User::factory()->count(2)->create();
    $notification = Notification::factory()->create();

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.send', $notification))
        ->assertRedirect();

    expect($notification->refresh()->status)->toBe(NotificationStatus::Sent)
        ->and($notification->recipients_count)->toBeGreaterThan(0);
});

test('sending something already sent changes nothing', function () {
    $notification = Notification::factory()->sent(3)->create();
    $sentAt = $notification->sent_at;

    $this->actingAs(platformSuperAdmin())
        ->post(route('platform.notifications.send', $notification))
        ->assertRedirect();

    expect($notification->refresh()->sent_at->toDateTimeString())->toBe($sentAt->toDateTimeString())
        ->and($notification->recipients_count)->toBe(3);
});

test('archiving and unarchiving move an announcement in and out of the working list', function () {
    $notification = Notification::factory()->sent(4)->create();
    $admin = platformSuperAdmin();

    $this->actingAs($admin)
        ->patch(route('platform.notifications.archive', $notification))
        ->assertRedirect();

    expect($notification->refresh()->status)->toBe(NotificationStatus::Archived);

    $this->actingAs($admin)
        ->patch(route('platform.notifications.unarchive', $notification))
        ->assertRedirect();

    // It was delivered, so it returns to Sent rather than pretending to be a draft.
    expect($notification->refresh()->status)->toBe(NotificationStatus::Sent);
});

test('unarchiving something never sent returns it to draft', function () {
    $notification = Notification::factory()->create([
        'status' => NotificationStatus::Archived,
        'sent_at' => null,
    ]);

    $this->actingAs(platformSuperAdmin())
        ->patch(route('platform.notifications.unarchive', $notification))
        ->assertRedirect();

    expect($notification->refresh()->status)->toBe(NotificationStatus::Draft);
});

test('deleting an announcement hides it from the list and from every inbox', function () {
    $recipient = User::factory()->create();
    $notification = Notification::factory()->create();
    $notification->receipts()->create(['user_id' => $recipient->id]);

    $this->actingAs(platformSuperAdmin())
        ->delete(route('platform.notifications.destroy', $notification))
        ->assertRedirect();

    expect($notification->refresh()->trashed())->toBeTrue()
        ->and($recipient->refresh()->unreadNotificationCount())->toBe(0)
        // The receipt survives, so the delete stays reversible.
        ->and($notification->receipts()->count())->toBe(1);
});

test('the delivery report lists recipients and can be narrowed to the unread', function () {
    $read = User::factory()->create(['name' => 'Ada Read']);
    $unread = User::factory()->create(['name' => 'Rem Unread']);

    $notification = Notification::factory()->sent(2)->create();
    $notification->receipts()->create(['user_id' => $read->id, 'read_at' => now()]);
    $notification->receipts()->create(['user_id' => $unread->id]);

    $admin = platformSuperAdmin();

    $this->actingAs($admin)
        ->get(route('platform.notifications.show', $notification))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('platform/notifications/show')
            ->has('recipients.data', 2)
            ->where('notification.read_count', 1)
        );

    $this->actingAs($admin)
        ->get(route('platform.notifications.show', [$notification, 'read' => 'unread']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recipients.data', 1)
            ->where('recipients.data.0.name', 'Rem Unread')
        );
});

test('a school announcement is not reachable through the platform module', function () {
    $school = School::factory()->create();
    $notification = Notification::factory()->forSchool($school)->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.notifications.show', $notification))
        ->assertNotFound();
});

test('the audience estimate counts the people a selection reaches', function () {
    User::factory()->platform()->count(2)->create();
    User::factory()->teacher()->count(3)->create();

    $this->actingAs(platformSuperAdmin())
        ->getJson(route('platform.notifications.estimate', [
            'audience_type' => NotificationAudience::AllTeachers->value,
        ]))
        ->assertOk()
        ->assertJson(['count' => 3, 'label' => 'All Teachers']);
});

test('the audience picker searches for people by name', function () {
    User::factory()->create(['name' => 'Marina Cole']);
    User::factory()->create(['name' => 'Desmond Yu']);

    $this->actingAs(platformSuperAdmin())
        ->getJson(route('platform.notifications.audience_options', ['resource' => 'users', 'q' => 'Marina']))
        ->assertOk()
        ->assertJsonCount(1, 'options')
        ->assertJsonPath('options.0.label', fn (string $label): bool => str_contains($label, 'Marina Cole'));
});

test('the audience picker resolves chosen people by id', function () {
    $chosen = User::factory()->create(['name' => 'Marina Cole']);
    User::factory()->create(['name' => 'Desmond Yu']);

    // Editing a draft aimed at named people: the ids are known but the labels are
    // not, because people are searched rather than listed.
    $this->actingAs(platformSuperAdmin())
        ->getJson(route('platform.notifications.audience_options', [
            'resource' => 'users',
            'ids' => [$chosen->id],
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'options')
        ->assertJsonPath('options.0.value', (string) $chosen->id)
        ->assertJsonPath('options.0.label', fn (string $label): bool => str_contains($label, 'Marina Cole'));
});

test('the audience picker resolves every kind of chosen id, not just people', function () {
    $wanted = School::factory()->create(['name' => 'Zenith Aquatics']);
    School::factory()->count(3)->create();

    // Asking for one organization must return one, not the whole list: the
    // picker uses this to name a chip whose id it cannot otherwise account for.
    $this->actingAs(platformSuperAdmin())
        ->getJson(route('platform.notifications.audience_options', [
            'resource' => 'organizations',
            'ids' => [$wanted->id],
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'options')
        ->assertJsonPath('options.0.label', 'Zenith Aquatics');

    $retired = Plan::factory()->create(['name' => 'Legacy']);
    $retired->delete();

    // A draft can outlive the plan it targets, and the chip still has to read.
    $this->actingAs(platformSuperAdmin())
        ->getJson(route('platform.notifications.audience_options', [
            'resource' => 'plans',
            'ids' => [$retired->id],
        ]))
        ->assertOk()
        ->assertJsonCount(1, 'options')
        ->assertJsonPath('options.0.label', 'Legacy');
});

test('the export honours the active filters', function () {
    Notification::factory()->create();
    Notification::factory()->sent(4)->create();

    $this->actingAs(platformSuperAdmin())
        ->get(route('platform.notifications.export', ['status' => 'sent', 'format' => 'csv']))
        ->assertOk()
        ->assertDownload();
});

test('announcement management is gated on its permissions', function () {
    $notification = Notification::factory()->create();
    $user = User::factory()->platform()->create();

    $this->actingAs($user)->get(route('platform.notifications.index'))->assertForbidden();
    $this->actingAs($user)->get(route('platform.notifications.show', $notification))->assertForbidden();
    $this->actingAs($user)->post(route('platform.notifications.store'), announcementPayload())->assertForbidden();
    $this->actingAs($user)->post(route('platform.notifications.send', $notification))->assertForbidden();
    $this->actingAs($user)->delete(route('platform.notifications.destroy', $notification))->assertForbidden();
    $this->actingAs($user)->get(route('platform.notifications.export'))->assertForbidden();
});

test('viewing announcements does not confer the right to send or delete them', function () {
    $notification = Notification::factory()->create();
    $user = platformUserWithPermissions([PermissionEnum::PLATFORM_NOTIFICATIONS_INDEX]);

    $this->actingAs($user)->get(route('platform.notifications.index'))->assertOk();
    $this->actingAs($user)->post(route('platform.notifications.store'), announcementPayload())->assertForbidden();
    $this->actingAs($user)->post(route('platform.notifications.send', $notification))->assertForbidden();
    $this->actingAs($user)->put(route('platform.notifications.update', $notification), announcementPayload())->assertForbidden();
    $this->actingAs($user)->delete(route('platform.notifications.destroy', $notification))->assertForbidden();
});
