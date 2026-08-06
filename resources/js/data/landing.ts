export const navLinks = [
    { label: 'Platform', href: '#platform' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#resources' },
] as const;

export const hero = {
    eyebrow: 'Staff Performance Management',
    titleBefore: 'Train, Certify & Track Swim School Staff From',
    titleHighlight: 'One Platform',
    description:
        'AquaCert streamlines onboarding, certification tracking, and legal compliance so swim schools can focus on teaching — not paperwork.',
    cta: 'Watch Platform Tour',
    complianceBadge: '94.2% Compliance',
} as const;

export const comparison = {
    title: 'The Old Way vs. The AquaCert Solution',
    description:
        'Replace fragmented spreadsheets and expired certificates with automated tracking built for aquatic facilities.',
    problems: {
        title: 'Current Problems',
        items: [
            'Manual Spreadsheets',
            'Expired Certificates',
            'Slow Onboarding',
        ],
    },
    solutions: {
        title: 'AquaCert Solution',
        items: [
            'Automated Tracking',
            'Rapid Verification',
            'Integrated Learning',
        ],
    },
} as const;

export const features = {
    title: 'Engineered Specifically for Swim Schools',
    description:
        'Every module is designed around the real workflows of aquatic staff training and compliance.',
    items: [
        {
            title: 'Staff Onboarding',
            description:
                'Invite new instructors, assign roles, and launch mandatory pathways in minutes.',
            href: '#platform',
            featured: true,
        },
        {
            title: 'Inventory & Portal',
            description:
                'Centralize certificates, documents, and school resources in one secure portal.',
            href: '#platform',
            featured: false,
        },
        {
            title: 'Video Training',
            description:
                'Deliver role-based video lessons with progress tracking and quiz verification.',
            href: '#solutions',
            featured: false,
        },
        {
            title: 'Boardroom Training',
            description:
                'Run leadership and policy sessions with attendance and completion records.',
            href: '#solutions',
            featured: false,
        },
    ],
} as const;

export const roadmap = {
    title: 'Six Steps to Complete Swim School Training Automation',
    steps: [
        {
            title: 'Invite Staff',
            description:
                'Send secure invites to instructors and admins across locations.',
        },
        {
            title: 'Assign Role',
            description:
                'Map each person to pathways that match their responsibilities.',
        },
        {
            title: 'Track Scores',
            description:
                'Monitor quiz results and learning progress in real time.',
        },
        {
            title: 'Verify Docs',
            description:
                'Confirm credentials and upload supporting documentation.',
        },
        {
            title: 'Send Certs',
            description:
                'Issue digital certificates the moment requirements are met.',
        },
        {
            title: 'Compliance',
            description:
                'Export audit-ready reports for ISO and insurance reviews.',
        },
    ],
} as const;

export const analytics = {
    title: 'Real-Time Analytics & ISO Compliance Auditing',
    description:
        'See compliance health across every location, identify high-risk staff instantly, and prove readiness when auditors arrive.',
    stats: [
        { value: '94.2%', label: 'Staff Compliant' },
        { value: '13 Days', label: 'Avg. Efficiency' },
    ],
} as const;

export const multiLocation = {
    title: 'Flawless Multi-Location Management',
    description:
        'Operate head office and every branch from one control plane — with shared standards and local visibility.',
    hq: 'Head Office (HQ)',
    sites: ['Site A: London', 'Site B: Manchester', 'Site C: Birmingham'],
} as const;

export const pricing = {
    title: 'Transparent Pricing for Every School',
    description:
        'Start with the LMS platform alone, or bundle ready-made aquatic training content.',
    plans: [
        {
            name: 'LMS Platform',
            price: 'Custom Quote',
            popular: false,
            features: [
                'Unlimited staff seats',
                'Role-based learning pathways',
                'Certificate vault & expiry alerts',
                'Multi-location dashboards',
                'Priority onboarding support',
            ],
        },
        {
            name: 'LMS + Training Content',
            price: 'Custom Quote',
            popular: true,
            features: [
                'Everything in LMS Platform',
                'Ready-made aquatic video library',
                'Boardroom & policy packs',
                'Quarterly content updates',
                'Dedicated success manager',
            ],
        },
    ],
} as const;

export const testimonial = {
    quote: 'We switched 14 aquatic facilities to AquaCert and cut more than 15 hours of paperwork every month. Compliance went from reactive to automatic.',
    name: 'Sarah Holmes',
    role: 'General Manager at Swim School Pro',
    avatar: '/images/marketing/testimonial-avatar.jpg',
} as const;

export const faqs = [
    {
        question: 'How does certification verification work?',
        answer: 'AquaCert tracks expiry dates, required modules, and uploaded credentials for every staff member. Managers get alerts before certificates lapse, and auditors can export a complete verification trail in one click.',
    },
    {
        question: 'Can I upload our own training videos?',
        answer: 'Yes. Upload school-specific videos, attach quizzes, and assign them to roles or locations while still using AquaCert’s shared aquatic curriculum.',
    },
    {
        question: 'Is pricing fixed or tied to users?',
        answer: 'Pricing is custom-quoted based on locations and content needs — not a rigid per-seat ladder — so growing schools are not punished for adding instructors.',
    },
] as const;

export const demoCta = {
    title: 'See How AquaCert Transforms Your Staff Training',
    benefits: [
        'Live walkthrough of the full platform',
        'Expert advice for your compliance goals',
        'Platform setup roadmap for your schools',
    ],
    formTitle: 'Book a free demo',
    submit: 'Book My Free Demo',
} as const;

export const footer = {
    mission:
        'AquaCert is the operating system for swim school education — training, certification, and compliance in one platform.',
    product: ['Platform', 'Solutions', 'Pricing', 'Resources'],
    company: ['About Us', 'Careers', 'Blog', 'Contact'],
    legal: ['Privacy Policy', 'Terms of Service', 'Legal'],
    copyright: '© 2026 AquaCert Inc. All rights reserved.',
} as const;

export const loginBrand = {
    headline: 'The operating system for swim school education.',
    description:
        'Manage hundreds of swim schools, thousands of learners, and endless certifications — all from one unified platform.',
    stats: [
        { label: '141+ swim school organizations' },
        { label: '18,940+ certificates issued' },
        { label: '3,400+ staff trained' },
        { label: '$1.18M ARR platform revenue' },
    ],
    copyright: '© 2026 AquaCert Inc.',
    links: ['Privacy', 'Terms', 'Help'],
} as const;
