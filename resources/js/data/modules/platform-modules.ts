import { brandColors } from '@/lib/brand-colors';

export type ModuleRow = Record<string, string | number>;

export const platformLocations = {
    title: 'Locations',
    subtitle: 'All swim school locations across the platform',
    columns: [
        { key: 'name', label: 'Location' },
        { key: 'organization', label: 'Organization' },
        { key: 'region', label: 'Region' },
        { key: 'staff', label: 'Staff' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Harbour View Pool',
            organization: 'BlueWave Swim',
            region: 'North America',
            staff: 42,
            status: 'Active',
        },
        {
            id: '2',
            name: 'Coral Bay Center',
            organization: 'Coral Reef Academy',
            region: 'Europe',
            staff: 38,
            status: 'Active',
        },
        {
            id: '3',
            name: 'TidePool Main',
            organization: 'TidePool Kids',
            region: 'North America',
            staff: 14,
            status: 'Trial',
        },
        {
            id: '4',
            name: 'Westside Aquatics',
            organization: 'Harbor Aquatics',
            region: 'APAC',
            staff: 22,
            status: 'Suspended',
        },
        {
            id: '5',
            name: 'Splash Masters HQ',
            organization: 'Splash Masters',
            region: 'Europe',
            staff: 19,
            status: 'Active',
        },
    ] satisfies ModuleRow[],
};

export const platformPeople = {
    title: 'People',
    subtitle: 'Platform staff and organization contacts',
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'organization', label: 'Organization' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Ava Thompson',
            email: 'ava@aquacert.io',
            role: 'Platform Admin',
            organization: 'AquaCert',
            status: 'Active',
        },
        {
            id: '2',
            name: 'Marcus Lee',
            email: 'marcus@bluewave.com',
            role: 'School Owner',
            organization: 'BlueWave Swim',
            status: 'Active',
        },
        {
            id: '3',
            name: 'Elena Ruiz',
            email: 'elena@coralreef.edu',
            role: 'Compliance Lead',
            organization: 'Coral Reef Academy',
            status: 'Active',
        },
        {
            id: '4',
            name: 'Noah Patel',
            email: 'noah@tidepool.kids',
            role: 'Branch Manager',
            organization: 'TidePool Kids',
            status: 'Invited',
        },
    ] satisfies ModuleRow[],
};

export const platformAccess = {
    title: 'Roles & Permissions',
    subtitle: 'Access control across the AquaCert platform',
    columns: [
        { key: 'name', label: 'Role' },
        { key: 'users', label: 'Users' },
        { key: 'permissions', label: 'Permissions' },
        { key: 'scope', label: 'Scope' },
        { key: 'updated', label: 'Updated' },
    ],
    rows: [
        {
            id: '1',
            name: 'Platform Super Admin',
            users: 4,
            permissions: 86,
            scope: 'Global',
            updated: '2026-03-01',
        },
        {
            id: '2',
            name: 'Platform Support',
            users: 12,
            permissions: 34,
            scope: 'Global',
            updated: '2026-02-18',
        },
        {
            id: '3',
            name: 'Billing Analyst',
            users: 3,
            permissions: 18,
            scope: 'Global',
            updated: '2026-01-22',
        },
        {
            id: '4',
            name: 'Content Publisher',
            users: 7,
            permissions: 22,
            scope: 'Learning',
            updated: '2026-03-10',
        },
    ] satisfies ModuleRow[],
};

export const platformLearning = {
    title: 'Learning',
    subtitle: 'Platform course library and content packs',
    columns: [
        { key: 'title', label: 'Course' },
        { key: 'category', label: 'Category' },
        { key: 'modules', label: 'Modules' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            category: 'Safety',
            modules: 6,
            enrolled: 4820,
            status: 'Published',
        },
        {
            id: '2',
            title: 'Lifeguard Certification',
            category: 'Certification',
            modules: 10,
            enrolled: 2140,
            status: 'Published',
        },
        {
            id: '3',
            title: 'Emergency First Aid',
            category: 'Emergency',
            modules: 5,
            enrolled: 3680,
            status: 'Published',
        },
        {
            id: '4',
            title: 'Pool Operations Essentials',
            category: 'Operations',
            modules: 8,
            enrolled: 910,
            status: 'Draft',
        },
        {
            id: '5',
            title: 'Child Safeguarding',
            category: 'Compliance',
            modules: 4,
            enrolled: 5200,
            status: 'Published',
        },
        {
            id: '6',
            title: 'Instructor Mentoring',
            category: 'Teaching',
            modules: 7,
            enrolled: 640,
            status: 'Review',
        },
    ] satisfies ModuleRow[],
};

export const platformPathways = {
    title: 'Learning Pathways',
    subtitle: 'Structured learning journeys for staff',
    columns: [
        { key: 'name', label: 'Pathway' },
        { key: 'audience', label: 'Audience' },
        { key: 'courses', label: 'Courses' },
        { key: 'assigned', label: 'Assigned' },
        { key: 'completion', label: 'Completion' },
    ],
    rows: [
        {
            id: '1',
            name: 'New Instructor Onboarding',
            audience: 'Instructors',
            courses: 5,
            assigned: 840,
            completion: '78%',
        },
        {
            id: '2',
            name: 'Lifeguard Pathway',
            audience: 'Lifeguards',
            courses: 4,
            assigned: 620,
            completion: '84%',
        },
        {
            id: '3',
            name: 'Facility Manager Track',
            audience: 'Managers',
            courses: 6,
            assigned: 210,
            completion: '61%',
        },
    ] satisfies ModuleRow[],
};

export const platformAssessments = {
    title: 'Assessments',
    subtitle: 'Quizzes and competency checks',
    columns: [
        { key: 'title', label: 'Assessment' },
        { key: 'course', label: 'Course' },
        { key: 'questions', label: 'Questions' },
        { key: 'passRate', label: 'Pass rate' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'Water Safety Quiz',
            course: 'Water Safety Fundamentals',
            questions: 20,
            passRate: '92%',
            status: 'Active',
        },
        {
            id: '2',
            title: 'Emergency Drill Check',
            course: 'Emergency First Aid',
            questions: 15,
            passRate: '87%',
            status: 'Active',
        },
        {
            id: '3',
            title: 'Chemical Safety Exam',
            course: 'Pool Operations',
            questions: 25,
            passRate: '79%',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const platformCertificates = {
    title: 'Certificates',
    subtitle: 'Issued, pending, and expired certificates',
    columns: [
        { key: 'number', label: 'Certificate #' },
        { key: 'holder', label: 'Holder' },
        { key: 'course', label: 'Course' },
        { key: 'organization', label: 'Organization' },
        { key: 'issued', label: 'Issued' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            number: 'AC-2026-004821',
            holder: 'Jordan Blake',
            course: 'Water Safety Fundamentals',
            organization: 'BlueWave Swim',
            issued: '2026-03-12',
            status: 'Valid',
        },
        {
            id: '2',
            number: 'AC-2026-004822',
            holder: 'Sam Rivera',
            course: 'First Aid Basics',
            organization: 'Coral Reef Academy',
            issued: '2026-03-14',
            status: 'Valid',
        },
        {
            id: '3',
            number: 'AC-2025-003110',
            holder: 'Lee Chen',
            course: 'Lifeguard Certification',
            organization: 'Harbor Aquatics',
            issued: '2025-01-20',
            status: 'Expired',
        },
        {
            id: '4',
            number: 'AC-2026-004901',
            holder: 'Priya Nair',
            course: 'Child Safeguarding',
            organization: 'Splash Masters',
            issued: '2026-03-20',
            status: 'Pending',
        },
    ] satisfies ModuleRow[],
};

export const platformReports = {
    title: 'Reports',
    subtitle: 'Platform analytics and exportable reports',
    columns: [
        { key: 'name', label: 'Report' },
        { key: 'category', label: 'Category' },
        { key: 'lastRun', label: 'Last run' },
        { key: 'owner', label: 'Owner' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Organization Growth',
            category: 'Business',
            lastRun: 'Today 08:00',
            owner: 'Platform',
            status: 'Ready',
        },
        {
            id: '2',
            name: 'Certificate Expiry Forecast',
            category: 'Compliance',
            lastRun: 'Yesterday',
            owner: 'Compliance',
            status: 'Ready',
        },
        {
            id: '3',
            name: 'Course Completion by Region',
            category: 'Learning',
            lastRun: 'Mar 18',
            owner: 'Learning Ops',
            status: 'Scheduled',
        },
    ] satisfies ModuleRow[],
};

export const platformNotifications = {
    title: 'Notifications',
    subtitle: 'Announcements and system alerts',
    columns: [
        { key: 'title', label: 'Notification' },
        { key: 'audience', label: 'Audience' },
        { key: 'channel', label: 'Channel' },
        { key: 'sent', label: 'Sent' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'March compliance reminder',
            audience: 'All schools',
            channel: 'Email',
            sent: '2026-03-01',
            status: 'Sent',
        },
        {
            id: '2',
            title: 'New course pack available',
            audience: 'School owners',
            channel: 'In-app',
            sent: '2026-03-12',
            status: 'Sent',
        },
        {
            id: '3',
            title: 'Scheduled maintenance window',
            audience: 'Platform staff',
            channel: 'Email',
            sent: '—',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const platformSupport = {
    title: 'Support Tools',
    subtitle: 'Impersonation, audits, and support utilities',
    columns: [
        { key: 'tool', label: 'Tool' },
        { key: 'description', label: 'Description' },
        { key: 'usage', label: 'Usage (30d)' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            tool: 'Impersonate user',
            description: 'View the app as a school or teacher account',
            usage: 28,
            status: 'Available',
        },
        {
            id: '2',
            tool: 'Audit log export',
            description: 'Download recent platform audit events',
            usage: 14,
            status: 'Available',
        },
        {
            id: '3',
            tool: 'Force password reset',
            description: 'Trigger a secure reset for locked accounts',
            usage: 6,
            status: 'Available',
        },
        {
            id: '4',
            tool: 'Feature flag toggle',
            description: 'Enable experimental modules per tenant',
            usage: 11,
            status: 'Restricted',
        },
    ] satisfies ModuleRow[],
};

export const platformSystemSettings = {
    title: 'System Settings',
    subtitle: 'Platform configuration and integrations',
    tabs: [
        {
            id: 'general',
            label: 'General',
            fields: [
                { label: 'Platform name', value: 'AquaCert' },
                { label: 'Support email', value: 'support@aquacert.io' },
                { label: 'Default timezone', value: 'UTC' },
            ],
        },
        {
            id: 'integrations',
            label: 'Integrations',
            fields: [
                { label: 'Email provider', value: 'Postmark' },
                { label: 'Storage', value: 'S3' },
                { label: 'Analytics', value: 'Enabled' },
            ],
        },
        {
            id: 'security',
            label: 'Security',
            fields: [
                { label: '2FA enforcement', value: 'Recommended' },
                { label: 'Session lifetime', value: '120 minutes' },
                { label: 'IP allowlist', value: 'Off' },
            ],
        },
        {
            id: 'branding',
            label: 'Branding',
            fields: [
                { label: 'Primary color', value: brandColors.navy500 },
                { label: 'Accent color', value: brandColors.aqua500 },
                { label: 'Logo', value: 'AquaCert mark' },
            ],
        },
        {
            id: 'billing',
            label: 'Billing',
            fields: [
                { label: 'Currency', value: 'USD' },
                { label: 'Tax mode', value: 'Exclusive' },
                { label: 'Invoice prefix', value: 'AC-' },
            ],
        },
    ],
};
