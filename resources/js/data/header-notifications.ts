export type HeaderNotification = {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    href?: string;
};

/** Fixture inbox for the header notifications popover (Figma Notification.png). */
export const headerNotifications: HeaderNotification[] = [
    {
        id: '1',
        title: 'Certificate Expiring Soon',
        description: "Tom Barker's Lifeguard cert expires in 14 days",
        time: '5 min ago',
        read: false,
        href: '#',
    },
    {
        id: '2',
        title: 'Training Overdue',
        description: '8 staff at Eastgate missed the CPR deadline',
        time: '32 min ago',
        read: false,
        href: '#',
    },
    {
        id: '3',
        title: 'New Staff Joined',
        description: 'Priya Shah was added to Harbour View location',
        time: '1 hour ago',
        read: false,
        href: '#',
    },
    {
        id: '4',
        title: 'Course Completed',
        description: 'Sarah Mitchell finished Emergency Response Protocols',
        time: '2 hours ago',
        read: true,
        href: '#',
    },
    {
        id: '5',
        title: 'Assessment Submitted',
        description: 'David Chen submitted Pool Operations quiz for review',
        time: 'Yesterday',
        read: true,
        href: '#',
    },
];
