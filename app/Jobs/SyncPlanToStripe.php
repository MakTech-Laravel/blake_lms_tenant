<?php

namespace App\Jobs;

use App\Models\Plan;
use App\Support\Billing\StripePlanSync;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncPlanToStripe implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $planId) {}

    public function handle(StripePlanSync $sync): void
    {
        $plan = Plan::withTrashed()->find($this->planId);

        if ($plan === null) {
            return;
        }

        $sync->sync($plan);
    }
}
