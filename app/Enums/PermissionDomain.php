<?php

namespace App\Enums;

/**
 * The dashboard a permission belongs to.
 *
 * Permissions are isolated by domain: a platform role may only ever be granted
 * PLATFORM permissions, and a school role may only ever be granted SCHOOL
 * permissions. This is enforced server-side (query + validation), never by
 * client-side convention.
 */
enum PermissionDomain: string
{
    case PLATFORM = 'platform';
    case SCHOOL = 'school';
}
