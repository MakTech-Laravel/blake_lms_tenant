<?php

namespace Database\Factories;

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\NotificationStatus;
use App\Models\Notification;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'school_id' => null,
            'created_by' => null,
            'title' => rtrim(fake()->sentence(4), '.'),
            'body' => fake()->paragraph(2),
            'category' => NotificationCategory::Announcement,
            'priority' => NotificationPriority::Normal,
            'action_label' => null,
            'action_url' => null,
            'channels' => [NotificationChannel::Database->value],
            'audience_type' => NotificationAudience::AllUsers,
            'audience' => null,
            'audience_label' => NotificationAudience::AllUsers->label(),
            'status' => NotificationStatus::Draft,
            'scheduled_at' => null,
            'sent_at' => null,
            'recipients_count' => 0,
        ];
    }

    /**
     * Attribute the announcement to an author.
     */
    public function from(User $sender): static
    {
        return $this->state(fn (array $attributes): array => [
            'created_by' => $sender->id,
            'school_id' => $sender->school_id,
        ]);
    }

    /**
     * A school-composed announcement, which may only address its own people.
     */
    public function forSchool(School $school): static
    {
        return $this->state(fn (array $attributes): array => [
            'school_id' => $school->id,
        ]);
    }

    /**
     * Set the targeting mode and, where the mode needs them, its ids.
     *
     * @param  array<int, int>  $ids
     */
    public function audience(NotificationAudience $audience, array $ids = []): static
    {
        return $this->state(function (array $attributes) use ($audience, $ids): array {
            $key = $audience->selectionKey();

            return [
                'audience_type' => $audience,
                'audience' => $key !== null && $ids !== [] ? [$key => $ids] : null,
                'audience_label' => $audience->label(),
            ];
        });
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => NotificationStatus::Draft,
            'scheduled_at' => null,
            'sent_at' => null,
        ]);
    }

    /**
     * Queued to go out later. Defaults to a future time so it is not picked up
     * by the dispatch command mid-test.
     */
    public function scheduled(?string $at = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => NotificationStatus::Scheduled,
            'scheduled_at' => $at ?? now()->addDay(),
            'sent_at' => null,
        ]);
    }

    /**
     * Already overdue, for exercising the dispatch command.
     */
    public function due(): static
    {
        return $this->scheduled(now()->subMinute()->toDateTimeString());
    }

    public function sent(int $recipients = 0): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => NotificationStatus::Sent,
            'sent_at' => now()->subDay(),
            'scheduled_at' => null,
            'recipients_count' => $recipients,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => NotificationStatus::Archived,
            'sent_at' => now()->subWeek(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => NotificationStatus::Failed,
            'sent_at' => null,
        ]);
    }

    /**
     * Turn the email channel on alongside the in-app copy.
     */
    public function withEmail(): static
    {
        return $this->state(fn (array $attributes): array => [
            'channels' => [
                NotificationChannel::Database->value,
                NotificationChannel::Mail->value,
            ],
        ]);
    }

    public function category(NotificationCategory $category): static
    {
        return $this->state(fn (array $attributes): array => [
            'category' => $category,
        ]);
    }

    public function priority(NotificationPriority $priority): static
    {
        return $this->state(fn (array $attributes): array => [
            'priority' => $priority,
        ]);
    }
}
