<?php

use App\Enums\NotificationStatus;
use App\Jobs\DispatchNotification;
use App\Jobs\SendNotificationEmails;
use App\Mail\AnnouncementMail;
use App\Models\Notification;
use App\Models\NotificationRecipient;
use App\Models\User;
use App\Support\Notifications\AudienceResolver;
use App\Support\Notifications\AudienceSelection;
use App\Support\Notifications\NotificationMessage;
use App\Support\Notifications\Notifier;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;

test('the fan-out writes one copy per addressed user', function () {
    $recipients = User::factory()->count(3)->create();
    $notification = Notification::factory()->create(['status' => NotificationStatus::Sending]);

    (new DispatchNotification($notification->id))->handle(app(AudienceResolver::class));

    expect($notification->refresh()->status)->toBe(NotificationStatus::Sent)
        ->and($notification->recipients_count)->toBe(3)
        ->and($notification->receipts()->pluck('user_id')->sort()->values()->all())
        ->toBe($recipients->pluck('id')->sort()->values()->all());
});

test('running the fan-out twice does not duplicate or re-notify anyone', function () {
    $user = User::factory()->create();
    $notification = Notification::factory()->create(['status' => NotificationStatus::Sending]);

    $resolver = app(AudienceResolver::class);

    (new DispatchNotification($notification->id))->handle($resolver);

    // The recipient reads it, then the job is retried after a transient failure.
    $user->markNotificationRead($notification);
    $sentAt = $notification->refresh()->sent_at;

    (new DispatchNotification($notification->id))->handle($resolver);

    expect(NotificationRecipient::query()->where('notification_id', $notification->id)->count())->toBe(1)
        // The retry must not undo what the recipient did with their copy.
        ->and($user->notificationReceipt($notification)->read_at)->not->toBeNull()
        // Nor claim a second send time.
        ->and($notification->refresh()->sent_at->toDateTimeString())->toBe($sentAt->toDateTimeString());
});

test('a retry tops up recipients who joined the audience in between', function () {
    User::factory()->create();
    $notification = Notification::factory()->create(['status' => NotificationStatus::Sending]);

    $resolver = app(AudienceResolver::class);

    (new DispatchNotification($notification->id))->handle($resolver);
    expect($notification->refresh()->recipients_count)->toBe(1);

    User::factory()->count(2)->create();
    (new DispatchNotification($notification->id))->handle($resolver);

    expect($notification->refresh()->recipients_count)->toBe(3)
        ->and($notification->receipts()->count())->toBe(3);
});

test('an announcement deleted before the job runs is skipped', function () {
    User::factory()->create();
    $notification = Notification::factory()->create(['status' => NotificationStatus::Sending]);
    $notification->delete();

    (new DispatchNotification($notification->id))->handle(app(AudienceResolver::class));

    expect(NotificationRecipient::query()->count())->toBe(0);
});

test('a failed fan-out is surfaced rather than left stuck on sending', function () {
    $notification = Notification::factory()->create(['status' => NotificationStatus::Sending]);

    (new DispatchNotification($notification->id))->failed(new RuntimeException('database gone'));

    expect($notification->refresh()->status)->toBe(NotificationStatus::Failed);
});

test('the email channel mails every recipient exactly once', function () {
    Mail::fake();

    $recipients = User::factory()->count(2)->create();
    $notification = Notification::factory()->withEmail()->sent(2)->create();

    foreach ($recipients as $recipient) {
        $notification->receipts()->create(['user_id' => $recipient->id]);
    }

    (new SendNotificationEmails($notification->id))->handle();

    Mail::assertQueued(AnnouncementMail::class, 2);

    // A retry finds nothing left to send, because each copy is stamped as it goes.
    (new SendNotificationEmails($notification->id))->handle();

    Mail::assertQueued(AnnouncementMail::class, 2);

    expect($notification->receipts()->whereNotNull('emailed_at')->count())->toBe(2);
});

test('no email is sent when the author left the channel off', function () {
    Mail::fake();

    $recipient = User::factory()->create();
    $notification = Notification::factory()->sent(1)->create();
    $notification->receipts()->create(['user_id' => $recipient->id]);

    (new SendNotificationEmails($notification->id))->handle();

    Mail::assertNothingQueued();

    expect($notification->receipts()->whereNotNull('emailed_at')->count())->toBe(0);
});

test('sending queues the email job only when the mail channel is on', function () {
    Queue::fake();

    User::factory()->create();
    $notifier = app(Notifier::class);

    $notifier->send(
        NotificationMessage::make('In-app only', 'No email for this one.'),
        AudienceSelection::allUsers(),
    );

    Queue::assertPushed(DispatchNotification::class, 1);
    Queue::assertNotPushed(SendNotificationEmails::class);
});

test('the email job is queued after the copies are written, not before', function () {
    Queue::fake([SendNotificationEmails::class]);

    User::factory()->create();

    $notification = Notification::factory()->withEmail()->create(['status' => NotificationStatus::Sending]);

    (new DispatchNotification($notification->id))->handle(app(AudienceResolver::class));

    Queue::assertPushed(SendNotificationEmails::class, 1);

    expect($notification->refresh()->status)->toBe(NotificationStatus::Sent);
});

test('an audience that reaches nobody sends no email at all', function () {
    Queue::fake([SendNotificationEmails::class]);

    $notification = Notification::factory()->withEmail()->create(['status' => NotificationStatus::Sending]);

    (new DispatchNotification($notification->id))->handle(app(AudienceResolver::class));

    Queue::assertNotPushed(SendNotificationEmails::class);

    expect($notification->refresh()->recipients_count)->toBe(0);
});

test('the scheduled command dispatches only what is due', function () {
    User::factory()->create();

    $due = Notification::factory()->due()->create(['title' => 'Due now']);
    $later = Notification::factory()->scheduled()->create(['title' => 'Next week']);
    $draft = Notification::factory()->create(['title' => 'Never scheduled']);

    $this->artisan('notifications:dispatch-scheduled')
        ->expectsOutputToContain('Due now')
        ->assertSuccessful();

    expect($due->refresh()->status)->toBe(NotificationStatus::Sent)
        ->and($due->recipients_count)->toBe(1)
        ->and($later->refresh()->status)->toBe(NotificationStatus::Scheduled)
        ->and($draft->refresh()->status)->toBe(NotificationStatus::Draft);
});

test('a second run of the scheduled command finds nothing left to do', function () {
    User::factory()->create();
    Notification::factory()->due()->create();

    $this->artisan('notifications:dispatch-scheduled')->assertSuccessful();

    $this->artisan('notifications:dispatch-scheduled')
        ->expectsOutput('No scheduled notifications are due.')
        ->assertSuccessful();

    expect(NotificationRecipient::query()->count())->toBe(1);
});

test('the announcement email renders with its own content', function () {
    $recipient = User::factory()->create(['name' => 'Nadia Fox']);
    $notification = Notification::factory()->withEmail()->sent()->create([
        'title' => 'Certificate renewal',
        'body' => 'Your certificate expires at the end of the month.',
        'action_label' => 'Renew now',
        'action_url' => 'https://example.test/renew',
    ]);

    $rendered = (new AnnouncementMail($notification, $recipient))->render();

    expect($rendered)->toContain('Certificate renewal')
        ->and($rendered)->toContain('Your certificate expires at the end of the month.')
        ->and($rendered)->toContain('Renew now')
        ->and($rendered)->toContain('https://example.test/renew');
});

test('the notify helper delivers to one person without a builder', function () {
    $recipient = User::factory()->create();
    User::factory()->count(2)->create();

    $notification = $recipient->notifyWith(
        NotificationMessage::make('Just for you', 'A one-to-one message.'),
    );

    expect($notification->status)->toBe(NotificationStatus::Sent)
        ->and($notification->recipients_count)->toBe(1)
        ->and($recipient->unreadNotificationCount())->toBe(1);
});
