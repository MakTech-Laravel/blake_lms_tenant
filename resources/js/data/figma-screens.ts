/**
 * Figma screen inventory — primary visual source per screen family.
 * JPEG/PNG are the visual source of truth; SVG used for token/asset extraction.
 */
export type FigmaScreen = {
    portal:
        'platform' | 'school' | 'branch' | 'learner' | 'marketing' | 'theme';
    family: string;
    primary: string;
    variants?: string[];
};

export const figmaScreens: FigmaScreen[] = [
    // Marketing / theme (done)
    {
        portal: 'marketing',
        family: 'Landing',
        primary: 'figma/Landing page.jpg',
    },
    { portal: 'marketing', family: 'Login', primary: 'figma/Login.jpg' },
    { portal: 'theme', family: 'Navy', primary: 'figma/theme/Blue.png' },
    { portal: 'theme', family: 'Aqua', primary: 'figma/theme/Blue-1.png' },

    // Platform
    {
        portal: 'platform',
        family: 'Overview',
        primary: 'figma/platform/Overview.jpg',
    },
    {
        portal: 'platform',
        family: 'Organizations',
        primary: 'figma/platform/Organizations.jpg',
        variants: [
            'Organizations-1',
            'Organizations-2',
            'Organizations-3',
            'Organizations-4',
            'Organizations-5',
            'Organizations-6',
            'Organizations-7',
            'Organizations-8',
        ],
    },
    {
        portal: 'platform',
        family: 'Locations',
        primary: 'figma/platform/Locations.jpg',
        variants: ['Locations-1', 'Locations-2', 'Locations-3'],
    },
    {
        portal: 'platform',
        family: 'Subscriptions',
        primary: 'figma/platform/Subscriptions.jpg',
        variants: ['Subscriptions-1', 'Subscriptions-2'],
    },
    {
        portal: 'platform',
        family: 'People',
        primary: 'figma/platform/People.jpg',
        variants: ['People-1', 'People-2'],
    },
    {
        portal: 'platform',
        family: 'Roles & Permissions',
        primary: 'figma/platform/Roles & Permissions.jpg',
        variants: ['Roles & Permissions-1'],
    },
    {
        portal: 'platform',
        family: 'Learning',
        primary: 'figma/platform/Learning.jpg',
        variants: [
            'Learning-1',
            'Learning-2',
            'Learning-3',
            'Learning-4',
            'Learning-5',
            'Learning-6',
        ],
    },
    {
        portal: 'platform',
        family: 'Learning Pathways',
        primary: 'figma/platform/Learning Pathways.jpg',
        variants: ['Learning Pathways-1', 'Learning Pathways-2'],
    },
    {
        portal: 'platform',
        family: 'Assessments',
        primary: 'figma/platform/Assessments.jpg',
        variants: ['Assessments-1', 'Assessments-2'],
    },
    {
        portal: 'platform',
        family: 'Certificates',
        primary: 'figma/platform/Certificates.jpg',
        variants: ['Certificates-1', 'Certificates-2', 'Certificates-3'],
    },
    {
        portal: 'platform',
        family: 'Reports',
        primary: 'figma/platform/Reports.jpg',
        variants: ['Reports-1', 'Reports-2'],
    },
    {
        portal: 'platform',
        family: 'Notifications',
        primary: 'figma/platform/Notifications.jpg',
        variants: ['Notifications-1'],
    },
    {
        portal: 'platform',
        family: 'Support Tools',
        primary: 'figma/platform/Support Tools.jpg',
        variants: ['Support Tools-1', 'Support Tools-2', 'Support Tools-3'],
    },
    {
        portal: 'platform',
        family: 'System Settings',
        primary: 'figma/platform/System Settings.jpg',
        variants: [
            'System Settings-1',
            'System Settings-2',
            'System Settings-3',
            'System Settings-4',
            'System Settings-5',
        ],
    },

    // School HO
    {
        portal: 'school',
        family: 'Overview',
        primary: 'figma/school/Overview.png',
    },
    {
        portal: 'school',
        family: 'People',
        primary: 'figma/school/People.png',
        variants: ['People-1', 'People-2', 'People-3', 'People-4'],
    },
    {
        portal: 'school',
        family: 'Roles & Permissions',
        primary: 'figma/school/Roles & Permissions.png',
        variants: ['Roles & Permissions-1'],
    },
    {
        portal: 'school',
        family: 'Locations',
        primary: 'figma/school/Locations.png',
    },
    {
        portal: 'school',
        family: 'Locations overviews',
        primary: 'figma/school/Locations overviews.png',
    },
    {
        portal: 'school',
        family: 'Add Location',
        primary: 'figma/school/Add Location.png',
    },
    {
        portal: 'school',
        family: 'Courses',
        primary: 'figma/school/Courses.png',
    },
    {
        portal: 'school',
        family: 'Courses wizard',
        primary: 'figma/school/Courses wizard 1.png',
        variants: ['Courses wizard 2', 'Courses wizard 3', 'Courses wizard 4'],
    },
    {
        portal: 'school',
        family: 'Library',
        primary: 'figma/school/Library.png',
        variants: ['Library-1'],
    },
    {
        portal: 'school',
        family: 'Pathways',
        primary: 'figma/school/Pathways.png',
        variants: ['Pathways-1', 'Pathways-2'],
    },
    {
        portal: 'school',
        family: 'Assignments',
        primary: 'figma/school/Assignments.png',
        variants: [
            'Assignments-1',
            'Assignments-2',
            'Assignments-3',
            'Assignments-4',
            'Assignments-5',
        ],
    },
    {
        portal: 'school',
        family: 'Assessments',
        primary: 'figma/school/Assessments.png',
        variants: ['Assessments-1', 'Assessments-2', 'Assessments-3'],
    },
    {
        portal: 'school',
        family: 'Certificates',
        primary: 'figma/school/Certificates.png',
        variants: [
            'Certificates-1',
            'Certificates-2',
            'Certificates-3',
            'Certificates-4',
        ],
    },
    {
        portal: 'school',
        family: 'Subscription & Billing',
        primary: 'figma/school/Subscription & Billing.png',
        variants: [
            'Subscription & Billing-1',
            'Subscription & Billing-2',
            'Subscription & Billing-3',
            'Subscription & Billing-4',
            'Subscription & Billing-5',
        ],
    },
    {
        portal: 'school',
        family: 'Reports',
        primary: 'figma/school/Reports.png',
    },
    {
        portal: 'school',
        family: 'Notifications',
        primary: 'figma/school/Notifications.png',
    },
    {
        portal: 'school',
        family: 'Notification',
        primary: 'figma/school/Notification.png',
    },
    {
        portal: 'school',
        family: 'Settings',
        primary: 'figma/school/Settings.png',
        variants: ['Settings-1', 'Settings-2', 'Settings-3'],
    },

    // Branch
    {
        portal: 'branch',
        family: 'Overview',
        primary: 'figma/school/branch/Overview 1.png',
    },
    {
        portal: 'branch',
        family: 'People',
        primary: 'figma/school/branch/People.png',
        variants: ['People-1', 'People-2', 'People-3'],
    },
    {
        portal: 'branch',
        family: 'Locations',
        primary: 'figma/school/branch/Locations.png',
    },
    {
        portal: 'branch',
        family: 'Locations overviews',
        primary: 'figma/school/branch/Locations overviews.png',
    },
    {
        portal: 'branch',
        family: 'Add Location',
        primary: 'figma/school/branch/Add Location.png',
    },
    {
        portal: 'branch',
        family: 'Courses',
        primary: 'figma/school/branch/Courses.png',
        variants: ['Courses-1', 'Courses-2'],
    },
    {
        portal: 'branch',
        family: 'Pathways',
        primary: 'figma/school/branch/Pathways.png',
        variants: ['Pathways-1', 'Pathways-2'],
    },
    {
        portal: 'branch',
        family: 'Assignments',
        primary: 'figma/school/branch/Assignments.png',
        variants: [
            'Assignments-1',
            'Assignments-2',
            'Assignments-3',
            'Assignments-4',
            'Assignments-5',
        ],
    },
    {
        portal: 'branch',
        family: 'Assessments',
        primary: 'figma/school/branch/Assessments.png',
        variants: ['Assessments-1', 'Assessments-2', 'Assessments-3'],
    },
    {
        portal: 'branch',
        family: 'Certificates',
        primary: 'figma/school/branch/Certificates.png',
        variants: [
            'Certificates-1',
            'Certificates-2',
            'Certificates-3',
            'Certificates-4',
            'Certificates-5',
        ],
    },
    {
        portal: 'branch',
        family: 'Reports',
        primary: 'figma/school/branch/Reports.png',
    },
    {
        portal: 'branch',
        family: 'Notifications',
        primary: 'figma/school/branch/Notifications.png',
    },
    {
        portal: 'branch',
        family: 'Notification',
        primary: 'figma/school/branch/Notification.png',
    },

    // Learner
    {
        portal: 'learner',
        family: 'Overview',
        primary: 'figma/teacher or learner/Overview.png',
        variants: ['Overview 4'],
    },
    {
        portal: 'learner',
        family: 'My Learning',
        primary: 'figma/teacher or learner/My Learning.png',
        variants: ['My Learning-1', 'My Learning-2'],
    },
    {
        portal: 'learner',
        family: 'Certificates',
        primary: 'figma/teacher or learner/Certificates.png',
        variants: ['Certificates-1'],
    },
    {
        portal: 'learner',
        family: 'Profile',
        primary: 'figma/teacher or learner/Profile.png',
    },
    {
        portal: 'learner',
        family: 'Settings',
        primary: 'figma/teacher or learner/Settings.png',
        variants: ['Settings-1', 'Settings-2'],
    },
    {
        portal: 'learner',
        family: 'Notifications',
        primary: 'figma/teacher or learner/Notifications.png',
    },
];

/** Phase 0 gap list — install in Phase 1 */
export const uiGapList = {
    shadcn: [
        'tabs',
        'progress',
        'popover',
        'textarea',
        'switch',
        'chart',
    ] as const,
    packages: ['recharts'] as const,
};
