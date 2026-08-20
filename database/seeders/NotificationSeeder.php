<?php

namespace Database\Seeders;

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Enums\UserType;
use App\Models\Notification;
use App\Models\Plan;
use App\Models\User;
use App\Support\Notifications\AudienceResolver;
use App\Support\Notifications\AudienceSelection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The platform announcement history shown in the Notifications module.
 *
 * Covers one row per status so every tab and stat card has something in it. The
 * two sent announcements are genuinely fanned out to real recipients, with a
 * portion marked read, so the delivery report and the header bell have real data
 * rather than a count with nothing behind it.
 */
class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->where('type', UserType::PLATFORM)->orderBy('id')->first();

        if ($author === null) {
            $this->command->warn('Notifications: skipped, no platform staff to attribute them to.');

            return;
        }

        $resolver = app(AudienceResolver::class);
        $enterprisePlanId = Plan::query()->where('slug', 'enterprise')->value('id');

        foreach ($this->announcements($enterprisePlanId) as $data) {
            $selection = AudienceSelection::make($data['audience_type'], $data['audience_ids']);

            $notification = Notification::updateOrCreate(
                ['title' => $data['title'], 'school_id' => null],
                [
                    'created_by' => $author->id,
                    'body' => $data['body'],
                    'category' => $data['category'],
                    'priority' => $data['priority'],
                    'action_label' => $data['action_label'],
                    'action_url' => $data['action_url'],
                    'channels' => $data['channels'],
                    'audience_type' => $selection->type,
                    'audience' => $selection->payload(),
                    'audience_label' => $resolver->describe($selection),
                    'status' => $data['status'],
                    'scheduled_at' => $data['scheduled_at'],
                    'sent_at' => $data['sent_at'],
                    'deleted_at' => null,
                ],
            );

            if ($data['status']->hasBeenDelivered()) {
                $this->deliver($notification, $resolver->query($selection)->pluck('users.id')->all());
            }
        }

        $this->command->info('Notifications: '.count($this->announcements($enterprisePlanId)).' seeded.');
    }

    /**
     * Write the recipient rows and mark roughly half of them read, so the read
     * receipts and unread badge have something believable in them.
     *
     * @param  array<int, int>  $userIds
     */
    private function deliver(Notification $notification, array $userIds): void
    {
        if ($userIds === []) {
            return;
        }

        $now = now();

        $rows = array_map(fn (int $userId, int $index): array => [
            'notification_id' => $notification->id,
            'user_id' => $userId,
            'read_at' => $index % 2 === 0 ? $notification->sent_at ?? $now : null,
            'created_at' => $now,
            'updated_at' => $now,
        ], $userIds, array_keys($userIds));

        foreach (array_chunk($rows, Notification::FANOUT_CHUNK) as $chunk) {
            DB::table('notification_user')->upsert(
                $chunk,
                ['notification_id', 'user_id'],
                ['read_at', 'updated_at'],
            );
        }

        $notification->update(['recipients_count' => count($userIds)]);
    }

    /**
     * @return array<int, array{
     *     title: string,
     *     body: string,
     *     category: NotificationCategory,
     *     priority: NotificationPriority,
     *     action_label: string|null,
     *     action_url: string|null,
     *     channels: array<int, string>,
     *     audience_type: NotificationAudience,
     *     audience_ids: array<int, int>,
     *     status: NotificationStatus,
     *     scheduled_at: Carbon|null,
     *     sent_at: Carbon|null
     * }>
     */
    private function announcements(?int $enterprisePlanId): array
    {
        $inApp = [NotificationChannel::Database->value];
        $inAppAndEmail = [NotificationChannel::Database->value, NotificationChannel::Mail->value];

        return [
            [
                'title' => 'Platform Maintenance Window',
                'body' => "Scheduled maintenance this weekend.\n\nAquaCert will be read-only on Saturday from 22:00 to 02:00 while we upgrade the reporting pipeline. Course progress recorded during the window will sync automatically once we are back.",
                'category' => NotificationCategory::SystemAlert,
                'priority' => NotificationPriority::High,
                'action_label' => null,
                'action_url' => null,
                'channels' => $inAppAndEmail,
                'audience_type' => NotificationAudience::AllOrganizations,
                'audience_ids' => [],
                'status' => NotificationStatus::Sent,
                'scheduled_at' => null,
                'sent_at' => now()->subDays(12),
            ],
            [
                'title' => 'New Course Library Update',
                'body' => '20 new courses arriving soon. The next content drop adds twenty courses across water safety, rescue technique, and pool chemistry, all mapped to the existing compliance pathways.',
                'category' => NotificationCategory::Course,
                'priority' => NotificationPriority::Normal,
                'action_label' => 'Browse the library',
                // The universal entry point, so the button resolves for whoever
                // receives it rather than for one portal only.
                'action_url' => route('dashboard'),
                'channels' => $inApp,
                'audience_type' => $enterprisePlanId !== null
                    ? NotificationAudience::SubscriptionPlan
                    : NotificationAudience::AllOrganizations,
                'audience_ids' => $enterprisePlanId !== null ? [$enterprisePlanId] : [],
                'status' => NotificationStatus::Scheduled,
                'scheduled_at' => now()->addDays(6),
                'sent_at' => null,
            ],
            [
                'title' => 'Q1 Compliance Reminder',
                'body' => 'Complete compliance audits. Every location needs its Q1 audit filed before the end of the quarter. Outstanding items are listed on your compliance dashboard.',
                'category' => NotificationCategory::Compliance,
                'priority' => NotificationPriority::Urgent,
                'action_label' => null,
                'action_url' => null,
                'channels' => $inApp,
                'audience_type' => NotificationAudience::AllSchoolStaff,
                'audience_ids' => [],
                'status' => NotificationStatus::Draft,
                'scheduled_at' => null,
                'sent_at' => null,
            ],
            [
                'title' => 'Holiday Schedule',
                'body' => 'Support hours during holidays. Chat and phone support run on reduced hours between the 24th and the 2nd. Email is monitored throughout, and urgent platform issues are escalated as usual.',
                'category' => NotificationCategory::Announcement,
                'priority' => NotificationPriority::Normal,
                'action_label' => null,
                'action_url' => null,
                'channels' => $inApp,
                'audience_type' => NotificationAudience::AllUsers,
                'audience_ids' => [],
                'status' => NotificationStatus::Archived,
                'scheduled_at' => null,
                'sent_at' => now()->subMonths(7),
            ],
            [
                'title' => 'Welcome to AquaCert v2',
                'body' => "Major platform upgrade live.\n\nThe new learner experience, the rebuilt assessment builder, and the redesigned certificate templates are all live. Nothing you have already published needs migrating.",
                'category' => NotificationCategory::Announcement,
                'priority' => NotificationPriority::Normal,
                'action_label' => null,
                'action_url' => null,
                'channels' => $inAppAndEmail,
                'audience_type' => NotificationAudience::AllUsers,
                'audience_ids' => [],
                'status' => NotificationStatus::Sent,
                'scheduled_at' => null,
                'sent_at' => now()->subMonths(6),
            ],
        ];
    }
}
