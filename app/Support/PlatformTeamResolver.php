<?php

namespace App\Support;

use Spatie\Permission\DefaultTeamResolver;

/**
 * Resolves the active Spatie "team" (school) id for permission checks.
 *
 * The platform dashboard uses a reserved team id ({@see self::PLATFORM_TEAM_ID})
 * rather than NULL. Spatie treats NULL-team (global) roles as belonging to every
 * team, which would make a global "super-admin"/"admin" role collide with the
 * per-school roles of the same name. Giving the platform its own team keeps the
 * platform and school role sets fully independent.
 *
 * When no team has been set explicitly (platform + teacher requests, seeders,
 * tests), the platform team is assumed. The ResolveTenant middleware overrides
 * this with the school id on `/school/{school}/*` routes.
 */
class PlatformTeamResolver extends DefaultTeamResolver
{
    /** Reserved team id for platform-level roles. No school ever has id 0. */
    public const PLATFORM_TEAM_ID = 0;

    public function getPermissionsTeamId(): int|string|null
    {
        return parent::getPermissionsTeamId() ?? self::PLATFORM_TEAM_ID;
    }
}
