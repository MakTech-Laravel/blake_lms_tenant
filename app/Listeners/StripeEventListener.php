<?php

namespace App\Listeners;

use App\Support\Billing\SyncSchoolSubscriptionFromStripe;
use Laravel\Cashier\Events\WebhookHandled;

class StripeEventListener
{
    /**
     * @var array<int, string>
     */
    private const HANDLED_EVENTS = [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.paid',
        'invoice.payment_failed',
        'checkout.session.completed',
    ];

    public function __construct(
        private readonly SyncSchoolSubscriptionFromStripe $syncSchoolSubscriptionFromStripe,
    ) {}

    public function handle(WebhookHandled $event): void
    {
        if (! in_array($event->payload['type'] ?? '', self::HANDLED_EVENTS, true)) {
            return;
        }

        $this->syncSchoolSubscriptionFromStripe->syncFromPayload($event->payload);
    }
}
