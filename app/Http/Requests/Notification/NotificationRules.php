<?php

namespace App\Http\Requests\Notification;

use App\Enums\NotificationAudience;
use App\Enums\NotificationCategory;
use App\Enums\NotificationPriority;
use App\Support\Notifications\AudienceSelection;
use App\Support\Notifications\NotificationMessage;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Rules shared by the create and update announcement requests.
 *
 * Two things make these more than a field list:
 *
 *  - The audience mode decides whether ids are required at all, and which table
 *    they must exist in. A "selected organizations" announcement with no
 *    organizations would address nobody, so it is rejected rather than saved.
 *  - `intent` is what the three footer buttons differ by. Validating it here
 *    keeps the controller from having to infer the author's intention from
 *    whether a date happens to be present.
 *
 * @mixin FormRequest
 */
trait NotificationRules
{
    /**
     * The builder's three submit buttons.
     *
     * @var array<int, string>
     */
    private const INTENTS = ['draft', 'schedule', 'send'];

    /**
     * A scheduled send is only meaningful in the future, and Stripe-style
     * far-future dates are almost always a typo, so the window is bounded.
     */
    private const SCHEDULE_MAX_DAYS = 365;

    /**
     * Drop the audience ids that do not belong to the chosen mode.
     *
     * The builder keeps a separate selection per mode so switching back and forth
     * does not lose work, which means it posts more ids than the saved
     * announcement should carry.
     */
    protected function normalizeAudience(): void
    {
        $audience = NotificationAudience::tryFrom((string) $this->input('audience_type'));

        $keys = ['school_ids', 'plan_ids', 'role_ids', 'user_ids'];
        $keep = $audience?->selectionKey();

        $this->merge(array_merge(
            array_fill_keys(array_diff($keys, [$keep]), []),
            // An empty schedule field arrives as an empty string, which would
            // fail the date rule rather than reading as "send immediately".
            blank($this->input('scheduled_at')) ? ['scheduled_at' => null] : [],
        ));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function notificationRules(): array
    {
        return [
            'title' => 'required|string|max:150',
            'body' => 'required|string|max:5000',

            'category' => ['required', new Enum(NotificationCategory::class)],
            'priority' => ['required', new Enum(NotificationPriority::class)],

            // Both halves of the action or neither: a button with no destination
            // is worse than no button.
            'action_label' => 'nullable|required_with:action_url|string|max:60',
            'action_url' => 'nullable|required_with:action_label|url|max:2048',

            'send_email' => 'boolean',

            'audience_type' => ['required', new Enum(NotificationAudience::class), Rule::in($this->allowedAudienceValues())],

            'school_ids' => [$this->requiredForAudience(NotificationAudience::SelectedOrganizations), 'array', 'max:200'],
            'school_ids.*' => ['integer', Rule::exists('schools', 'id')],

            'plan_ids' => [$this->requiredForAudience(NotificationAudience::SubscriptionPlan), 'array', 'max:50'],
            'plan_ids.*' => ['integer', Rule::exists('plans', 'id')],

            'role_ids' => [$this->requiredForAudience(NotificationAudience::Roles), 'array', 'max:200'],
            'role_ids.*' => ['integer', Rule::exists('roles', 'id')],

            'user_ids' => [$this->requiredForAudience(NotificationAudience::IndividualUsers), 'array', 'max:500'],
            'user_ids.*' => ['integer', Rule::exists('users', 'id')],

            'intent' => ['required', Rule::in(self::INTENTS)],

            // Required only for the Schedule button; ignored by the other two.
            'scheduled_at' => [
                Rule::requiredIf(fn (): bool => $this->input('intent') === 'schedule'),
                'nullable',
                'date',
                'after:now',
                'before:'.now()->addDays(self::SCHEDULE_MAX_DAYS)->toDateTimeString(),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function notificationMessages(): array
    {
        return [
            'title.required' => 'Give the announcement a title.',
            'body.required' => 'Write the message you want to send.',
            'audience_type.in' => 'That audience is not available from here.',
            'school_ids.required' => 'Choose at least one organization to send to.',
            'plan_ids.required' => 'Choose at least one plan to send to.',
            'role_ids.required' => 'Choose at least one role to send to.',
            'user_ids.required' => 'Choose at least one person to send to.',
            'scheduled_at.required' => 'Pick when this should go out, or send it now instead.',
            'scheduled_at.after' => 'A scheduled send has to be in the future.',
            'scheduled_at.before' => 'Schedule this within the next '.self::SCHEDULE_MAX_DAYS.' days.',
            'action_url.required_with' => 'An action button needs a destination.',
            'action_label.required_with' => 'An action button needs a label.',
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function notificationAttributes(): array
    {
        return [
            'audience_type' => 'audience',
            'school_ids' => 'organizations',
            'plan_ids' => 'plans',
            'role_ids' => 'roles',
            'user_ids' => 'people',
            'scheduled_at' => 'schedule',
            'action_label' => 'button label',
            'action_url' => 'button link',
            'send_email' => 'email delivery',
        ];
    }

    /**
     * The validated content, ready for the Notifier.
     */
    public function toNotificationMessage(): NotificationMessage
    {
        return NotificationMessage::make($this->validated('title'), $this->validated('body'))
            ->category(NotificationCategory::from($this->validated('category')))
            ->priority(NotificationPriority::from($this->validated('priority')))
            ->action($this->validated('action_label'), $this->validated('action_url'))
            ->alsoByEmail((bool) $this->validated('send_email', false));
    }

    /**
     * The validated audience, clamped to one organization when the module is
     * school-scoped.
     */
    public function toAudienceSelection(?int $schoolId = null): AudienceSelection
    {
        return AudienceSelection::fromArray($this->validated(), $schoolId);
    }

    /**
     * When the announcement should go out, or NULL for "now" / "not yet".
     */
    public function scheduledFor(): ?CarbonInterface
    {
        if ($this->validated('intent') !== 'schedule') {
            return null;
        }

        $scheduledAt = $this->validated('scheduled_at');

        return $scheduledAt !== null ? CarbonImmutable::parse($scheduledAt) : null;
    }

    public function intent(): string
    {
        return (string) $this->validated('intent');
    }

    /**
     * Only require a mode's ids when that mode is the one selected.
     */
    private function requiredForAudience(NotificationAudience $audience): ValidationRule|string
    {
        return Rule::requiredIf(
            fn (): bool => $this->input('audience_type') === $audience->value,
        );
    }

    /**
     * The audience values this module permits. Overridden by the school request,
     * which withholds the cross-organization modes.
     *
     * @return array<int, string>
     */
    protected function allowedAudienceValues(): array
    {
        return NotificationAudience::values();
    }
}
