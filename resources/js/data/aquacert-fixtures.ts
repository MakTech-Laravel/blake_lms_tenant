import { brandColors } from '@/lib/brand-colors';

export type StatMetric = {
    label: string;
    value: string | number;
    trend?: string;
    trendTone?: 'up' | 'down' | 'neutral';
};

export type ActivityItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    initials?: string;
};

export type QuickAction = {
    id: string;
    label: string;
};

export type ChartPoint = {
    name: string;
    value: number;
    secondary?: number;
};

export type DonutSlice = {
    name: string;
    value: number;
    color: string;
};

export const platformOverview = {
    title: 'Platform Dashboard',
    subtitle: 'Real-time overview of your AquaCert ecosystem.',
    kpis: [
        {
            label: 'Total Organizations',
            value: 15,
            trend: '+12%',
            trendTone: 'up',
        },
        {
            label: 'Active Organizations',
            value: 9,
            trend: '+8%',
            trendTone: 'up',
        },
        {
            label: 'Trial Organizations',
            value: 3,
            trend: '+3%',
            trendTone: 'up',
        },
        { label: 'Suspended', value: 3, trend: '-1%', trendTone: 'down' },
        { label: 'Total Locations', value: 156 },
        { label: 'Total Staff', value: '3,482' },
        { label: 'Total Courses', value: 124 },
        {
            label: 'Certificates Issued',
            value: '18,940',
            trend: '+24%',
            trendTone: 'up',
        },
    ] satisfies StatMetric[],
    revenue: {
        mrr: '$9.0K',
        arr: '$107K',
        renewals: 42,
        growth: '+14% Growth QoQ',
        series: [
            { name: 'Jul', value: 6.2 },
            { name: 'Aug', value: 6.8 },
            { name: 'Sep', value: 7.1 },
            { name: 'Oct', value: 7.6 },
            { name: 'Nov', value: 8.1 },
            { name: 'Dec', value: 8.5 },
            { name: 'Jan', value: 9.0 },
        ] satisfies ChartPoint[],
    },
    subscriptions: [
        { name: 'LMS Only', value: 42, color: brandColors.navy500 },
        { name: 'LMS + Content', value: 78, color: brandColors.aqua500 },
        { name: 'Enterprise', value: 21, color: brandColors.aqua300 },
    ] satisfies DonutSlice[],
    learning: {
        assigned: '9,210',
        completed: '6,847',
        pathways: 38,
        assessments: '4,120',
        courses: [
            { name: 'Water Safety Fundamentals', value: 88 },
            { name: 'Lifeguard Certification', value: 72 },
            { name: 'Emergency First Aid', value: 64 },
            { name: 'Pool Operations', value: 51 },
        ],
    },
    systemHealth: {
        storage: '1.4 TB / 2 TB',
        storagePercent: 70,
        email: 'Operational',
        api: 'Operational',
        sessions: '1,284',
    },
    activity: [
        {
            id: '1',
            title: 'Wavecrest Swimming was onboarded',
            description: 'Organization created',
            time: '2m ago',
            initials: 'WS',
        },
        {
            id: '2',
            title: 'Enterprise plan renewed',
            description: 'Harbor Aquatics',
            time: '18m ago',
            initials: 'HA',
        },
        {
            id: '3',
            title: 'Certificate batch issued',
            description: '356 certificates',
            time: '1h ago',
            initials: 'CB',
        },
        {
            id: '4',
            title: 'Support ticket escalated',
            description: 'API rate limit inquiry',
            time: '3h ago',
            initials: 'ST',
        },
    ] satisfies ActivityItem[],
    quickActions: [
        { id: '1', label: 'Create Organization' },
        { id: '2', label: 'Create Plan' },
        { id: '3', label: 'Create Course' },
        { id: '4', label: 'Create Pathway' },
        { id: '5', label: 'Send Announcement' },
        { id: '6', label: 'Generate Report' },
    ] satisfies QuickAction[],
    organizations: [
        {
            id: '1',
            name: 'BlueWave Swim',
            region: 'North America',
            plan: 'LMS + Training Content',
            locations: 8,
            staff: 124,
            status: 'Active',
            renewal: '2026-11-01',
        },
        {
            id: '2',
            name: 'Coral Reef Academy',
            region: 'Europe',
            plan: 'Enterprise',
            locations: 12,
            staff: 210,
            status: 'Active',
            renewal: '2026-09-15',
        },
        {
            id: '3',
            name: 'TidePool Kids',
            region: 'North America',
            plan: 'LMS Only',
            locations: 2,
            staff: 28,
            status: 'Trial',
            renewal: '2026-04-01',
        },
        {
            id: '4',
            name: 'Harbor Aquatics',
            region: 'APAC',
            plan: 'LMS + Training Content',
            locations: 5,
            staff: 67,
            status: 'Suspended',
            renewal: '2026-03-20',
        },
        {
            id: '5',
            name: 'Splash Masters',
            region: 'Europe',
            plan: 'LMS Only',
            locations: 3,
            staff: 41,
            status: 'Active',
            renewal: '2027-01-10',
        },
    ],
};

export const schoolOverview = {
    greeting: 'Good morning, Kevin 👋',
    subtitle: "Here's what's happening across your 12 locations today.",
    kpis: [
        {
            label: 'Total Staff',
            value: 248,
            trend: '+12 this month',
            trendTone: 'up',
        },
        {
            label: 'Active Staff',
            value: 231,
            trend: '+8 this week',
            trendTone: 'up',
        },
        {
            label: 'New Joiners',
            value: 17,
            trend: '+5 this week',
            trendTone: 'up',
        },
        {
            label: 'Locations',
            value: 12,
            trend: '+1 this month',
            trendTone: 'up',
        },
        {
            label: 'Assigned Courses',
            value: '1,482',
            trend: '+94 this week',
            trendTone: 'up',
        },
        {
            label: 'Completed Courses',
            value: '1,109',
            trend: '+67 this week',
            trendTone: 'up',
        },
        {
            label: 'Compliance Rate',
            value: '94.2%',
            trend: '+2.1% this month',
            trendTone: 'up',
        },
        {
            label: 'Certificates Issued',
            value: 356,
            trend: '+23 this month',
            trendTone: 'up',
        },
    ] satisfies StatMetric[],
    completionTrend: [
        { name: 'Jul', value: 90, secondary: 120 },
        { name: 'Aug', value: 110, secondary: 130 },
        { name: 'Sep', value: 125, secondary: 145 },
        { name: 'Oct', value: 140, secondary: 160 },
        { name: 'Nov', value: 155, secondary: 170 },
        { name: 'Dec', value: 148, secondary: 165 },
        { name: 'Jan', value: 170, secondary: 190 },
    ] satisfies ChartPoint[],
    certificates: [
        { name: 'Issued', value: 356, color: brandColors.navy500 },
        { name: 'Pending', value: 47, color: brandColors.aqua500 },
        { name: 'Expired', value: 28, color: brandColors.aqua700 },
        { name: 'Revoked', value: 8, color: brandColors.navy100 },
    ] satisfies DonutSlice[],
    locationPerformance: [
        { name: 'Harbour View', value: 96 },
        { name: 'Bayside', value: 91 },
        { name: 'Northshore', value: 88 },
        { name: 'Westside', value: 84 },
        { name: 'Eastgate', value: 79 },
        { name: 'Lakeside', value: 73 },
    ] satisfies ChartPoint[],
    activity: [
        {
            id: '1',
            title: 'Sarah Mitchell',
            description: 'completed Emergency Response Protocols',
            time: '2 min ago',
            initials: 'SM',
        },
        {
            id: '2',
            title: 'Daniel Cho',
            description: 'started Water Safety Fundamentals',
            time: '14 min ago',
            initials: 'DC',
        },
        {
            id: '3',
            title: 'Priya Nair',
            description: 'earned Lifeguard certificate',
            time: '1 hour ago',
            initials: 'PN',
        },
        {
            id: '4',
            title: 'Omar Hassan',
            description: 'submitted assessment retake',
            time: '3 hours ago',
            initials: 'OH',
        },
    ] satisfies ActivityItem[],
    deadlines: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            meta: 'All instructors · Due Mar 12',
            status: 'In Progress',
        },
        {
            id: '2',
            title: 'Child Safeguarding & Protection',
            meta: 'Managers · Due Mar 8',
            status: 'Overdue',
        },
        {
            id: '3',
            title: 'Emergency Response Protocols',
            meta: 'Lifeguards · Due Mar 18',
            status: 'In Progress',
        },
        {
            id: '4',
            title: 'New Instructor Onboarding',
            meta: 'New joiners · Due Mar 5',
            status: 'Completed',
        },
    ],
    quickActions: [
        { id: '1', label: 'Add Staff' },
        { id: '2', label: 'Create Course' },
        { id: '3', label: 'Assign Training' },
        { id: '4', label: 'Create Pathway' },
        { id: '5', label: 'Generate Report' },
        { id: '6', label: 'View Certificates' },
    ] satisfies QuickAction[],
};

export const learnerOverview = {
    greeting: 'Good morning, Jordan 👋',
    subtitle: 'You have 3 pending assessments and 1 overdue course.',
    kpis: [
        { label: 'Assigned', value: 8 },
        { label: 'Completed', value: 5 },
        { label: 'Pathways', value: 2 },
        { label: 'Assessments', value: 3 },
        { label: 'Certificates', value: 2 },
        { label: 'Deadlines', value: 2 },
    ] satisfies StatMetric[],
    continueLearning: {
        title: 'Emergency Response Procedures',
        progress: 40,
    },
    progress: {
        overall: 62,
        courseCompletion: 62,
        pathwayProgress: 42,
        certifications: 50,
        coursesDone: '5 of 8 courses',
    },
    weeklyActivity: [
        { name: 'Mon', value: 2 },
        { name: 'Tue', value: 4 },
        { name: 'Wed', value: 3 },
        { name: 'Thu', value: 6 },
        { name: 'Fri', value: 5 },
        { name: 'Sat', value: 1 },
        { name: 'Sun', value: 2 },
    ] satisfies ChartPoint[],
    weeklyStats: { lessons: 17, quizzes: 3, time: '4h 20m' },
    activity: [
        {
            id: '1',
            title: 'Completed: Module 6 — Water Safety Fundamentals',
            description: '',
            time: 'Today 9:14 AM',
        },
        {
            id: '2',
            title: 'Certificate Issued: Water Safety Fundamentals',
            description: '',
            time: 'Today 9:15 AM',
        },
        {
            id: '3',
            title: 'Passed Quiz: Pool Chemical Safety Check',
            description: '',
            time: 'Yesterday 2:30 PM',
        },
        {
            id: '4',
            title: 'Started: Emergency Response — Module 3',
            description: '',
            time: 'Yesterday 1:15 PM',
        },
        {
            id: '5',
            title: 'New Assignment: Emergency Drill Assessment',
            description: '',
            time: 'Jun 23, 10:00 AM',
        },
    ] satisfies ActivityItem[],
    quickActions: [
        { id: '1', label: 'Continue Learning' },
        { id: '2', label: 'View Certificates' },
        { id: '3', label: 'Notifications' },
        { id: '4', label: 'Update Profile' },
    ] satisfies QuickAction[],
    courses: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            category: 'Safety',
            duration: '3h 20m',
            modules: '6/6',
            progress: 100,
            status: 'Completed',
            due: '2026-05-31',
        },
        {
            id: '2',
            title: 'Emergency Response Procedures',
            category: 'Emergency',
            duration: '4h 10m',
            modules: '3/8',
            progress: 40,
            status: 'In Progress',
            due: '2026-06-15',
        },
        {
            id: '3',
            title: 'Pool Chemical Safety',
            category: 'Operations',
            duration: '2h 00m',
            modules: '0/4',
            progress: 0,
            status: 'Not Started',
            due: '2026-07-01',
        },
        {
            id: '4',
            title: 'Child Safeguarding',
            category: 'Teaching',
            duration: '1h 45m',
            modules: '1/5',
            progress: 15,
            status: 'Overdue',
            due: '2026-03-01',
        },
        {
            id: '5',
            title: 'Lifeguard Refreshers',
            category: 'Safety',
            duration: '2h 30m',
            modules: '4/5',
            progress: 80,
            status: 'In Progress',
            due: '2026-06-20',
        },
        {
            id: '6',
            title: 'First Aid Basics',
            category: 'Emergency',
            duration: '3h 00m',
            modules: '5/5',
            progress: 100,
            status: 'Completed',
            due: '2026-04-12',
        },
        {
            id: '7',
            title: 'Instructor Mentoring',
            category: 'Teaching',
            duration: '2h 15m',
            modules: '0/6',
            progress: 0,
            status: 'Not Started',
            due: '2026-08-01',
        },
        {
            id: '8',
            title: 'Facility Operations',
            category: 'Operations',
            duration: '3h 40m',
            modules: '2/7',
            progress: 28,
            status: 'In Progress',
            due: '2026-07-18',
        },
    ],
    certificates: [
        {
            id: '1',
            title: 'Water Safety Fundamentals',
            issued: '2026-03-12',
            expires: '2028-03-12',
            status: 'Valid',
        },
        {
            id: '2',
            title: 'First Aid Basics',
            issued: '2026-04-12',
            expires: '2027-04-12',
            status: 'Valid',
        },
    ],
};
