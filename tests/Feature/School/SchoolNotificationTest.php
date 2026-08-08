<?php

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Enums\PermissionEnum;
use App\Models\Notification;
use App\Models\School;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Valid school announcement payload, overridable per test.
 *
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function schoolAnnouncementPayload(array $overrides = []): array
{
    return [
        'title' => 'Pool closed for maintenance',
        'body' => 'The main pool is closed on Tuesday for resurfacing.',
        'category' => NotificationCategory::Announcement->value,
        'priority' => NotificationPriority::Normal->value,
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

test('the school list shows only this organization announcements', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    Notification::factory()->forSchool($school)->create(['title' => 'Ours']);
    Notification::factory()->forSchool($other)->create(['title' => 'Theirs']);
    Notification::factory()->create(['title' => 'Platform wide']);

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.index', $school))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/notifications/index')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.title', 'Ours')
            ->where('stats.total', 1)
        );
});

test('the school builder withholds the cross-organization audiences', function () {
    $school = School::factory()->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.index', $school))
        ->assertInertia(function (Assert $page) {
            $offered = collect($page->toArray()['props']['audienceOptions'])->pluck('value')->all();

            expect($offered)->not->toContain(NotificationAudience::AllPlatformUsers->value)
                ->and($offered)->not->toContain(NotificationAudience::SelectedOrganizations->value)
                ->and($offered)->not->toContain(NotificationAudience::SubscriptionPlan->value)
                ->and($offered)->toContain(NotificationAudience::AllTeachers->value);
        });
});

test('a school announcement is attributed to that school and reaches its own people only', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $author = schoolSuperAdmin($school);
    $insider = User::factory()->teacher($school)->create();
    $outsider = User::factory()->teacher($other)->create();

    $this->actingAs($author)
        ->post(route('school.notifications.store', $school), schoolAnnouncementPayload(['intent' => 'send']))
        ->assertRedirect(route('school.notifications.index', $school));

    $notification = Notification::query()->sole();
    $reached = $notification->receipts()->pluck('user_id');

    expect($notification->school_id)->toBe($school->id)
        ->and($notification->status)->toBe(NotificationStatus::Sent)
        ->and($reached)->toContain($author->id)
        ->and($reached)->toContain($insider->id)
        ->and($reached)->not->toContain($outsider->id);
});

test('naming somebody at another organization does not get them the announcement', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $insider = User::factory()->teacher($school)->create();
    $outsider = User::factory()->teacher($other)->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->post(route('school.notifications.store', $school), schoolAnnouncementPayload([
            'intent' => 'send',
            'audience_type' => NotificationAudience::IndividualUsers->value,
            'user_ids' => [$insider->id, $outsider->id],
        ]))
        ->assertRedirect();

    $reached = Notification::query()->sole()->receipts()->pluck('user_id');

    expect($reached->all())->toBe([$insider->id]);
});

test('an audience the school module does not offer is refused', function () {
    $school = School::factory()->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->post(route('school.notifications.store', $school), schoolAnnouncementPayload([
            'audience_type' => NotificationAudience::AllPlatformUsers->value,
        ]))
        ->assertSessionHasErrors('audience_type');
});

test('one school cannot open, send, or delete another school announcement', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $foreign = Notification::factory()->forSchool($other)->create();
    $admin = schoolSuperAdmin($school);

    $this->actingAs($admin)
        ->get(route('school.notifications.show', [$school, $foreign]))
        ->assertNotFound();

    $this->actingAs($admin)
        ->post(route('school.notifications.send', [$school, $foreign]))
        ->assertNotFound();

    $this->actingAs($admin)
        ->delete(route('school.notifications.destroy', [$school, $foreign]))
        ->assertNotFound();

    expect($foreign->refresh()->trashed())->toBeFalse();
});

test('a platform announcement is not managed from a school module', function () {
    $school = School::factory()->create();
    $platformWide = Notification::factory()->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.show', [$school, $platformWide]))
        ->assertNotFound();
});

test('the school audience picker offers only this organization people and roles', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $insider = User::factory()->schoolStaff($school)->create(['name' => 'Inside Ivy']);
    User::factory()->schoolStaff($other)->create(['name' => 'Outside Otto']);

    $this->actingAs(schoolSuperAdmin($school))
        ->getJson(route('school.notifications.audience_options', [$school, 'resource' => 'users']))
        ->assertOk()
        ->assertJsonPath('options', function (array $options) use ($insider): bool {
            $labels = collect($options)->pluck('label')->implode(' ');

            return str_contains($labels, $insider->name) && ! str_contains($labels, 'Outside Otto');
        });
});

test('the school estimate counts only this organization people', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    User::factory()->teacher($school)->count(2)->create();
    User::factory()->teacher($other)->count(5)->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->getJson(route('school.notifications.estimate', [
            $school,
            'audience_type' => NotificationAudience::AllTeachers->value,
        ]))
        ->assertOk()
        ->assertJson(['count' => 2]);
});

test('the school delivery report shows who read it', function () {
    $school = School::factory()->create();

    $reader = User::factory()->teacher($school)->create();
    $notification = Notification::factory()->forSchool($school)->sent(1)->create();
    $notification->receipts()->create(['user_id' => $reader->id, 'read_at' => now()]);

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.show', [$school, $notification]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('school/notifications/show')
            ->has('recipients.data', 1)
            ->where('notification.read_count', 1)
        );
});

test('the school export downloads', function () {
    $school = School::factory()->create();
    Notification::factory()->forSchool($school)->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.export', [$school, 'format' => 'csv']))
        ->assertOk()
        ->assertDownload();
});

test('school announcement management is gated on its permissions', function () {
    $school = School::factory()->create();
    $notification = Notification::factory()->forSchool($school)->create();
    $user = User::factory()->schoolStaff($school)->create();

    $this->actingAs($user)->get(route('school.notifications.index', $school))->assertForbidden();
    $this->actingAs($user)->get(route('school.notifications.show', [$school, $notification]))->assertForbidden();
    $this->actingAs($user)
        ->post(route('school.notifications.store', $school), schoolAnnouncementPayload())
        ->assertForbidden();
    $this->actingAs($user)->delete(route('school.notifications.destroy', [$school, $notification]))->assertForbidden();
});

test('viewing school announcements does not confer the right to send them', function () {
    $school = School::factory()->create();
    $notification = Notification::factory()->forSchool($school)->create();
    $user = schoolStaffWithPermissions($school, [PermissionEnum::SCHOOL_NOTIFICATIONS_INDEX]);

    $this->actingAs($user)->get(route('school.notifications.index', $school))->assertOk();
    $this->actingAs($user)
        ->post(route('school.notifications.store', $school), schoolAnnouncementPayload())
        ->assertForbidden();
    $this->actingAs($user)->post(route('school.notifications.send', [$school, $notification]))->assertForbidden();
});

test('a school admin cannot reach another organization module at all', function () {
    $school = School::factory()->create();
    $other = School::factory()->create();

    $this->actingAs(schoolSuperAdmin($school))
        ->get(route('school.notifications.index', $other))
        ->assertForbidden();
});
