import type { ModuleRow } from '@/data/modules/platform-modules';
import { brandColors } from '@/lib/brand-colors';

export const schoolPeople = {
    title: 'People',
    subtitle: 'Staff directory for your school',
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'location', label: 'Location' },
        { key: 'compliance', label: 'Compliance' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Sarah Mitchell',
            role: 'Instructor',
            location: 'Harbour View',
            compliance: '98%',
            status: 'Active',
        },
        {
            id: '2',
            name: 'Daniel Cho',
            role: 'Lifeguard',
            location: 'Bayside',
            compliance: '91%',
            status: 'Active',
        },
        {
            id: '3',
            name: 'Priya Nair',
            role: 'Branch Manager',
            location: 'Northshore',
            compliance: '100%',
            status: 'Active',
        },
        {
            id: '4',
            name: 'Omar Hassan',
            role: 'Instructor',
            location: 'Westside',
            compliance: '74%',
            status: 'On Leave',
        },
        {
            id: '5',
            name: 'Emily Brooks',
            role: 'New Joiner',
            location: 'Eastgate',
            compliance: '42%',
            status: 'Invited',
        },
    ] satisfies ModuleRow[],
};

export const schoolAccess = {
    title: 'Roles & Permissions',
    subtitle: 'School roles and permission sets',
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
            name: 'School Owner',
            users: 2,
            permissions: 64,
            scope: 'Head Office',
            updated: '2026-03-01',
        },
        {
            id: '2',
            name: 'Branch Manager',
            users: 12,
            permissions: 38,
            scope: 'Branch',
            updated: '2026-02-20',
        },
        {
            id: '3',
            name: 'Training Coordinator',
            users: 6,
            permissions: 28,
            scope: 'School',
            updated: '2026-03-08',
        },
        {
            id: '4',
            name: 'Front Desk',
            users: 18,
            permissions: 12,
            scope: 'Branch',
            updated: '2026-01-15',
        },
    ] satisfies ModuleRow[],
};

export const schoolLocations = {
    title: 'Locations',
    subtitle: 'Branches and facility locations',
    columns: [
        { key: 'name', label: 'Location' },
        { key: 'manager', label: 'Manager' },
        { key: 'staff', label: 'Staff' },
        { key: 'compliance', label: 'Compliance' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Harbour View',
            manager: 'Priya Nair',
            staff: 28,
            compliance: '96%',
            status: 'Active',
        },
        {
            id: '2',
            name: 'Bayside',
            manager: 'Daniel Cho',
            staff: 22,
            compliance: '91%',
            status: 'Active',
        },
        {
            id: '3',
            name: 'Northshore',
            manager: 'Sarah Mitchell',
            staff: 19,
            compliance: '88%',
            status: 'Active',
        },
        {
            id: '4',
            name: 'Westside',
            manager: 'Omar Hassan',
            staff: 16,
            compliance: '84%',
            status: 'Active',
        },
        {
            id: '5',
            name: 'Eastgate',
            manager: 'Emily Brooks',
            staff: 14,
            compliance: '79%',
            status: 'Opening',
        },
    ] satisfies ModuleRow[],
};

export const schoolCoursesUi = {
    title: 'Courses',
    subtitle: 'School courses and training content',
    columns: [
        { key: 'title', label: 'Course' },
        { key: 'category', label: 'Category' },
        { key: 'assigned', label: 'Assigned' },
        { key: 'completion', label: 'Completion' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            category: 'Safety',
            assigned: 210,
            completion: '88%',
            status: 'Published',
        },
        {
            id: '2',
            title: 'Emergency Response Protocols',
            category: 'Emergency',
            assigned: 186,
            completion: '72%',
            status: 'Published',
        },
        {
            id: '3',
            title: 'Child Safeguarding',
            category: 'Compliance',
            assigned: 248,
            completion: '94%',
            status: 'Published',
        },
        {
            id: '4',
            title: 'Pool Chemical Safety',
            category: 'Operations',
            assigned: 94,
            completion: '61%',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const schoolLibrary = {
    title: 'Library',
    subtitle: 'Shared training library and media',
    columns: [
        { key: 'name', label: 'Asset' },
        { key: 'type', label: 'Type' },
        { key: 'size', label: 'Size' },
        { key: 'updated', label: 'Updated' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Pool Emergency Drill.pdf',
            type: 'PDF',
            size: '2.4 MB',
            updated: '2026-03-10',
            status: 'Published',
        },
        {
            id: '2',
            name: 'Rescue Techniques.mp4',
            type: 'Video',
            size: '184 MB',
            updated: '2026-02-28',
            status: 'Published',
        },
        {
            id: '3',
            name: 'Chemical SDS Pack.zip',
            type: 'Archive',
            size: '12 MB',
            updated: '2026-03-02',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const schoolPathways = {
    title: 'Pathways',
    subtitle: 'Role-based learning pathways',
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
            name: 'Instructor Onboarding',
            audience: 'Instructors',
            courses: 5,
            assigned: 64,
            completion: '81%',
        },
        {
            id: '2',
            name: 'Lifeguard Pathway',
            audience: 'Lifeguards',
            courses: 4,
            assigned: 42,
            completion: '76%',
        },
        {
            id: '3',
            name: 'Manager Leadership',
            audience: 'Managers',
            courses: 6,
            assigned: 12,
            completion: '58%',
        },
    ] satisfies ModuleRow[],
};

export const schoolAssignments = {
    title: 'Assignments',
    subtitle: 'Assigned training across locations',
    columns: [
        { key: 'title', label: 'Assignment' },
        { key: 'audience', label: 'Audience' },
        { key: 'due', label: 'Due' },
        { key: 'progress', label: 'Progress' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            audience: 'All instructors',
            due: 'Mar 12',
            progress: '78%',
            status: 'In Progress',
        },
        {
            id: '2',
            title: 'Child Safeguarding',
            audience: 'Managers',
            due: 'Mar 8',
            progress: '54%',
            status: 'Overdue',
        },
        {
            id: '3',
            title: 'Emergency Response',
            audience: 'Lifeguards',
            due: 'Mar 18',
            progress: '62%',
            status: 'In Progress',
        },
        {
            id: '4',
            title: 'New Instructor Onboarding',
            audience: 'New joiners',
            due: 'Mar 5',
            progress: '100%',
            status: 'Completed',
        },
        {
            id: '5',
            title: 'Chemical Safety Refresh',
            audience: 'Ops staff',
            due: 'Apr 1',
            progress: '12%',
            status: 'Scheduled',
        },
    ] satisfies ModuleRow[],
};

export const schoolAssessments = {
    title: 'Assessments',
    subtitle: 'Quizzes and competency checks',
    columns: [
        { key: 'title', label: 'Assessment' },
        { key: 'course', label: 'Course' },
        { key: 'attempts', label: 'Attempts' },
        { key: 'passRate', label: 'Pass rate' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            title: 'Water Safety Quiz',
            course: 'Water Safety Fundamentals',
            attempts: 210,
            passRate: '94%',
            status: 'Active',
        },
        {
            id: '2',
            title: 'Emergency Drill',
            course: 'Emergency Response',
            attempts: 148,
            passRate: '88%',
            status: 'Active',
        },
        {
            id: '3',
            title: 'Safeguarding Check',
            course: 'Child Safeguarding',
            attempts: 248,
            passRate: '97%',
            status: 'Active',
        },
        {
            id: '4',
            title: 'Ops Practical',
            course: 'Pool Chemical Safety',
            attempts: 36,
            passRate: '71%',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const schoolCertificates = {
    title: 'Certificates',
    subtitle: 'Issued and expiring certificates',
    columns: [
        { key: 'number', label: 'Certificate #' },
        { key: 'holder', label: 'Holder' },
        { key: 'course', label: 'Course' },
        { key: 'issued', label: 'Issued' },
        { key: 'expires', label: 'Expires' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            number: 'BW-2026-0182',
            holder: 'Sarah Mitchell',
            course: 'Water Safety Fundamentals',
            issued: '2026-02-12',
            expires: '2028-02-12',
            status: 'Valid',
        },
        {
            id: '2',
            number: 'BW-2026-0190',
            holder: 'Daniel Cho',
            course: 'Lifeguard Certification',
            issued: '2026-03-01',
            expires: '2027-03-01',
            status: 'Valid',
        },
        {
            id: '3',
            number: 'BW-2025-0104',
            holder: 'Omar Hassan',
            course: 'First Aid Basics',
            issued: '2025-01-10',
            expires: '2026-01-10',
            status: 'Expired',
        },
        {
            id: '4',
            number: 'BW-2026-0201',
            holder: 'Emily Brooks',
            course: 'Child Safeguarding',
            issued: '—',
            expires: '—',
            status: 'Pending',
        },
    ] satisfies ModuleRow[],
};

export const schoolBilling = {
    title: 'Subscription & Billing',
    subtitle: 'Plan details and invoices',
    columns: [
        { key: 'invoice', label: 'Invoice' },
        { key: 'period', label: 'Period' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Method' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            invoice: 'INV-10482',
            period: 'Mar 2026',
            amount: '$890.00',
            method: 'Card',
            status: 'Paid',
        },
        {
            id: '2',
            invoice: 'INV-10391',
            period: 'Feb 2026',
            amount: '$890.00',
            method: 'Card',
            status: 'Paid',
        },
        {
            id: '3',
            invoice: 'INV-10288',
            period: 'Jan 2026',
            amount: '$890.00',
            method: 'Card',
            status: 'Paid',
        },
        {
            id: '4',
            invoice: 'INV-10510',
            period: 'Apr 2026',
            amount: '$890.00',
            method: 'Card',
            status: 'Upcoming',
        },
    ] satisfies ModuleRow[],
    plan: {
        name: 'LMS + Training Content',
        seats: 250,
        used: 248,
        renewal: '2026-11-01',
        mrr: '$890',
    },
};

export const schoolReports = {
    title: 'Reports',
    subtitle: 'Compliance and training reports',
    columns: [
        { key: 'name', label: 'Report' },
        { key: 'category', label: 'Category' },
        { key: 'lastRun', label: 'Last run' },
        { key: 'status', label: 'Status' },
    ],
    rows: [
        {
            id: '1',
            name: 'Location Compliance',
            category: 'Compliance',
            lastRun: 'Today',
            status: 'Ready',
        },
        {
            id: '2',
            name: 'Certificate Expiry',
            category: 'Certificates',
            lastRun: 'Yesterday',
            status: 'Ready',
        },
        {
            id: '3',
            name: 'Assignment Progress',
            category: 'Learning',
            lastRun: 'Mar 18',
            status: 'Scheduled',
        },
    ] satisfies ModuleRow[],
};

export const schoolNotifications = {
    title: 'Notifications',
    subtitle: 'School alerts and announcements',
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
            title: 'March training deadline',
            audience: 'All staff',
            channel: 'Email',
            sent: '2026-03-01',
            status: 'Sent',
        },
        {
            id: '2',
            title: 'New pathway published',
            audience: 'Managers',
            channel: 'In-app',
            sent: '2026-03-12',
            status: 'Sent',
        },
        {
            id: '3',
            title: 'Eastgate opening briefing',
            audience: 'Eastgate staff',
            channel: 'Email',
            sent: '—',
            status: 'Draft',
        },
    ] satisfies ModuleRow[],
};

export const schoolSettings = {
    title: 'Settings',
    subtitle: 'School preferences and branding',
    tabs: [
        {
            id: 'general',
            label: 'General',
            fields: [
                { label: 'School name', value: 'BlueWave Swim' },
                { label: 'Primary contact', value: 'Marcus Lee' },
                { label: 'Timezone', value: 'America/New_York' },
            ],
        },
        {
            id: 'branding',
            label: 'Branding',
            fields: [
                { label: 'Accent', value: brandColors.aqua500 },
                { label: 'Logo', value: 'BlueWave mark' },
                { label: 'Email footer', value: 'Enabled' },
            ],
        },
        {
            id: 'compliance',
            label: 'Compliance',
            fields: [
                { label: 'Certificate expiry alerts', value: '30 days' },
                { label: 'Mandatory pathways', value: 'On' },
                { label: 'Audit retention', value: '24 months' },
            ],
        },
        {
            id: 'notifications',
            label: 'Notifications',
            fields: [
                { label: 'Digest frequency', value: 'Weekly' },
                { label: 'SMS alerts', value: 'Off' },
                { label: 'Manager escalations', value: 'On' },
            ],
        },
    ],
};

/** Branch-scoped fixture overrides (slightly different roster / counts). */
export const branchPeople = {
    ...schoolPeople,
    subtitle: 'Staff at this branch location',
    rows: schoolPeople.rows.slice(0, 4),
};

export const branchCourses = {
    ...schoolCoursesUi,
    subtitle: 'Courses assigned to this branch',
    rows: schoolCoursesUi.rows.slice(0, 3),
};

export const branchCertificates = {
    ...schoolCertificates,
    subtitle: 'Certificates for this branch',
    rows: schoolCertificates.rows.slice(0, 3),
};

export const branchAssignments = {
    ...schoolAssignments,
    subtitle: 'Assignments for this branch',
    rows: schoolAssignments.rows.slice(0, 4),
};
