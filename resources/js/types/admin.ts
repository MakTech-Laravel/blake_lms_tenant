// =============================================================================
// ADMIN — shared shapes for the access-management pages
// (admin/users, admin/roles, admin/permissions).
// =============================================================================

/** The protected, system-critical role. Mirrors App\Enums\RoleEnum::SUPER_ADMIN. */
export const SUPER_ADMIN_ROLE = 'super-admin';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface RoleRef {
    id: number;
    name: string;
}

/** A branch a staff member or course can be pinned to. */
export interface BranchOption {
    id: number;
    name: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    email_verified_at: string | null;
    created_at: string;
    roles: RoleRef[];
    /** NULL means head-office (school-wide) access. School accounts only. */
    branch_id?: number | null;
    branch?: BranchOption | null;
}

export interface AdminUserDetail extends AdminUser {
    permissions: { id: number; name: string }[];
    updated_at: string;
}

export interface AdminRoleListItem {
    id: number;
    name: string;
    guard_name: string;
    permissions_count: number;
    users_count: number;
    is_system: boolean;
    scope: string;
    updated_at: string | null;
    updated_label: string;
    created_at: string;
}

export interface AdminRoleDetail {
    id: number;
    name: string;
    permissions: string[];
    is_super_admin: boolean;
}

/** Role summary shown on the read-only role detail page. */
export interface AdminRoleSummary {
    id: number;
    name: string;
    display_name: string;
    guard_name: string;
    is_system: boolean;
    scope: string;
    users_count: number;
    granted_count: number;
    total_count: number;
    created_label: string;
    updated_label: string;
    updated_relative: string;
}

/** Every permission in a group, flagged with whether the role grants it. */
export interface RolePermissionGroup {
    group: string;
    total: number;
    granted_count: number;
    permissions: {
        name: string;
        label: string;
        granted: boolean;
    }[];
}

export interface RoleAssignedUser {
    id: number;
    name: string;
    email: string;
    initials: string;
    avatar_url: string | null;
    type_label: string;
    status: string;
    profile_url: string;
}

// =============================================================================
// ORGANIZATIONS — platform tenant management
// =============================================================================

/** A row in the platform Organizations list. */
export interface OrganizationListItem {
    id: number;
    slug: string;
    name: string;
    initials: string;
    region: string;
    email: string;
    plan: string;
    plan_slug: string;
    locations_count: number;
    staff_count: number;
    /** Display label, e.g. "Active". Keys into the StatusBadge tone map. */
    status: string;
    /** Enum value, e.g. "active". Used when submitting a status change. */
    status_value: string;
    mrr_label: string;
    renewal_label: string;
    show_url: string;
    edit_url: string;
}

/** Headline numbers above the Organizations list. */
export interface OrganizationStats {
    trial: number;
    suspended: number;
    total: number;
    mrr: number;
    mrr_label: string;
}

export interface OrganizationSummary {
    id: number;
    slug: string;
    name: string;
    initials: string;
    email: string;
    phone: string;
    address: string;
    region: string;
    status: string;
    status_value: string;
    locations_count: number;
    staff_count: number;
    courses_count: number;
    created_label: string;
    updated_relative: string;
}

/** The organization's commercial agreement, or null when it has no plan. */
export interface OrganizationSubscription {
    plan: string;
    plan_description: string;
    /** "Fixed" or "TBA", from the plan's pricing type. */
    pricing_label: string;
    monthly_price_label: string;
    mrr_label: string;
    renewal_label: string;
    renewal_relative: string;
    trial_days: number;
    trial_label: string;
    trial_ends_label: string;
    is_billable: boolean;
}

export interface OrganizationLocation {
    id: number;
    name: string;
    slug: string;
    address: string;
    staff_count: number;
    status: string;
}

export interface OrganizationStaffMember {
    id: number;
    name: string;
    email: string;
    initials: string;
    avatar_url: string | null;
    branch: string;
    status: string;
    profile_url: string;
}

/** A selectable plan, with the list price used to prefill the rate field. */
export interface PlanOption {
    value: string;
    label: string;
    id: number;
    pricing_type: 'fixed' | 'custom';
    /** NULL on custom-priced plans, where the rate is quoted per organization. */
    monthly_price: number | null;
    /** "$990.00" or "Custom". */
    price_label: string;
    trial_days: number;
}

/** A pricing card on the Subscriptions > Plans tab. */
export interface PlanCard {
    id: number;
    slug: string;
    name: string;
    description: string;
    pricing_type: 'fixed' | 'custom';
    /** "Fixed" or "Custom". */
    pricing_label: string;
    /** "$990" on a fixed plan, "Let's Talk" on a custom one. */
    price_headline: string;
    /** "per month", or "Custom pricing" on a custom plan. */
    price_caption: string;
    /** NULL when the plan has no annual option. */
    annual_price_label: string | null;
    /** Staff, location, course, and storage caps as display strings. */
    limit_badges: string[];
    features: string[];
    trial_label: string;
    organizations_count: number;
    sort_order: number;
    /** Display label: "Active", "Inactive", or "Archived". */
    status: string;
    is_popular: boolean;
    is_active: boolean;
    is_archived: boolean;
    edit_url: string;
    /** The Organizations list, prefiltered to this plan. */
    organizations_url: string;
}

/** A row on the Subscriptions > Subscription Tracking tab. */
export interface SubscriptionTrackingRow {
    id: number;
    organization: string;
    organization_slug: string;
    region: string;
    plan: string;
    /** "$0" unless the organization is billable. */
    mrr_label: string;
    /** Display label, e.g. "Expired". Keys into the StatusBadge tone map. */
    status: string;
    /** Enum value, e.g. "expired". */
    status_value: string;
    renewal_label: string;
    trial_label: string;
    show_url: string;
}

/** One count per derived subscription status, keyed by enum value. */
export interface SubscriptionStats {
    active: number;
    trial: number;
    expired: number;
    suspended: number;
}

/** A single assignable permission, as sent to the role editor. */
export interface PermissionOption {
    id: number;
    name: string;
    group: string;
    label?: string;
}

/** A value/label pair for a select, filter, or audience picker. */
export interface SelectOption {
    value: string;
    label: string;
}

/**
 * One audience mode in the announcement builder.
 *
 * `resource` names the option list the mode needs ("organizations", "plans",
 * "roles", "users") and is null for the self-contained modes such as "all users".
 */
export interface NotificationAudienceOption extends SelectOption {
    description: string;
    resource: string | null;
}

/** An authored announcement, as shown in the platform and school lists. */
export interface NotificationListItem {
    id: number;
    title: string;
    body: string;
    excerpt: string;

    category: string;
    category_value: string;

    priority: string;
    priority_value: string;
    /** False for Normal, whose badge would only add noise. */
    priority_elevated: boolean;

    audience_label: string;
    audience_type: string;
    audience_ids: number[];

    channel_label: string;
    sends_email: boolean;

    action_label: string | null;
    action_url: string | null;

    /** Display label, e.g. "Scheduled". Keys into the StatusBadge tone map. */
    status: string;
    /** Enum value, e.g. "scheduled". */
    status_value: string;
    is_editable: boolean;
    is_sendable: boolean;
    is_archived: boolean;

    date_label: string;
    date_relative: string;
    /** `YYYY-MM-DDTHH:mm`, ready for a datetime-local input. */
    scheduled_at: string | null;
    sent_label: string | null;

    recipients_count: number;
    read_count: number;

    sender: string;
    organization: string | null;

    show_url: string;
    update_url: string;
    send_url: string;
    archive_url: string;
    unarchive_url: string;
    destroy_url: string;
}

/** One count per notification status, plus the overall total. */
export interface NotificationStats {
    total: number;
    draft: number;
    scheduled: number;
    sending: number;
    sent: number;
    failed: number;
    archived: number;
}

/** Module-level endpoints, so one component serves both notification modules. */
export interface NotificationModuleRoutes {
    index: string;
    store: string;
    export: string;
    audience_options: string;
    estimate: string;
}

/** One row of an announcement's delivery report. */
export interface NotificationRecipientRow {
    id: number;
    name: string;
    email: string;
    initials: string;
    avatar_url: string | null;
    type: string;
    read_at_label: string;
    read_relative: string | null;
    is_read: boolean;
    emailed: boolean;
    /** The recipient deleted their own copy; it was still delivered. */
    removed: boolean;
}

/** One notification as the recipient sees it, in the inbox and the bell. */
export interface InboxNotification {
    id: number;
    title: string;
    body: string;
    excerpt: string;

    category: string;
    category_value: string;

    priority: string;
    priority_value: string;
    priority_elevated: boolean;

    action_label: string | null;
    action_url: string | null;

    sender: string;

    is_read: boolean;
    is_archived: boolean;
    read_at_label: string | null;

    received_label: string;
    received_relative: string;

    read_url: string;
    unread_url: string;
    archive_url: string;
    unarchive_url: string;
    destroy_url: string;
}

/** A permission row for the read-only permissions listing. */
export interface PermissionListItem {
    id: number;
    name: string;
    group: string;
    guard_name: string;
    roles_count: number;
}

/** Build the public URL for a stored avatar path, or null. */
export function avatarUrl(path: string | null): string | null {
    if (!path) {
        return null;
    }

    return path.startsWith('http') ? path : `/storage/${path}`;
}

/** Group an ordered permission list by its `group` field, preserving order. */
export function groupByGroup<T extends { group: string }>(
    items: T[],
): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
        (acc[item.group] ??= []).push(item);

        return acc;
    }, {});
}
