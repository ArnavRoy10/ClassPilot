import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  Wallet,
  ClipboardList,
  BarChart3,
  CalendarDays,
  Megaphone,
  MessageCircle,
  LifeBuoy,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/**
 * Sidebar navigation for the authenticated application.
 * Grouped by workflow so the shell scales as more modules are added.
 */
export const appNav: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Center-wide summary and today at a glance.',
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        title: 'Students',
        href: '/students',
        icon: Users,
        description: 'Enrollments, profiles and contact details.',
      },
      {
        title: 'Teachers',
        href: '/teachers',
        icon: GraduationCap,
        description: 'Faculty, subjects and assignments.',
      },
      {
        title: 'Batches',
        href: '/batches',
        icon: Layers,
        description: 'Class groups, timings and capacity.',
      },
    ],
  },
  {
    label: 'Academics',
    items: [
      {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarCheck,
        description: 'Daily attendance across batches.',
      },
      {
        title: 'Tests',
        href: '/tests',
        icon: ClipboardList,
        description: 'Assessments and exam schedules.',
      },
      {
        title: 'Results',
        href: '/results',
        icon: BarChart3,
        description: 'Scores, rankings and progress.',
      },
      {
        title: 'Timetable',
        href: '/timetable',
        icon: CalendarDays,
        description: 'Weekly class schedule.',
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        title: 'Fees',
        href: '/fees',
        icon: Wallet,
        description: 'Invoices, payments and dues.',
      },
      {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
        description: 'Notices for students and parents.',
      },
      {
        title: 'Communications',
        href: '/communications',
        icon: MessageCircle,
        description: 'Send targeted messages to your community.',
      },
      {
        title: 'Support',
        href: '/support',
        icon: LifeBuoy,
        description: 'Get help and track support conversations.',
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: FileBarChart,
        description: 'Financial and academic reports.',
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Center profile and preferences.',
      },
    ],
  },
]

/** Flat lookup used for breadcrumbs and page metadata. */
export const flatNav: NavItem[] = appNav.flatMap((group) => group.items)

export function findNavItem(pathname: string): NavItem | undefined {
  return flatNav.find((item) => item.href === pathname)
}
