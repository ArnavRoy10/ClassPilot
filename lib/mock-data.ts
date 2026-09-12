/**
 * ============================================================================
 * MOCK DATA — PREVIEW ONLY
 * ----------------------------------------------------------------------------
 * Every value in this file is placeholder sample data used to build out the
 * UI for a single example tenant ("Bright Future Academy"). None of it is
 * persisted or fetched from a backend. It will be replaced by real,
 * tenant-scoped database queries in the next stage.
 * ============================================================================
 */

export const MOCK_TENANT = {
  name: 'Bright Future Academy',
  plan: 'Growth',
  city: 'Pune',
  ownerName: 'Ananya Sharma',
  ownerEmail: 'ananya@brightfuture.example',
}

export type StatCard = {
  key: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  hint: string
}

export const MOCK_STATS: StatCard[] = [
  {
    key: 'students',
    label: 'Total Students',
    value: '486',
    delta: '+24',
    trend: 'up',
    hint: 'vs last month',
  },
  {
    key: 'attendance',
    label: "Today's Attendance",
    value: '92%',
    delta: '+3.1%',
    trend: 'up',
    hint: '431 of 486 present',
  },
  {
    key: 'dues',
    label: 'Pending Fees',
    value: '₹2.4L',
    delta: '-8%',
    trend: 'down',
    hint: '38 students with dues',
  },
  {
    key: 'revenue',
    label: 'Monthly Revenue',
    value: '₹11.8L',
    delta: '+12.5%',
    trend: 'up',
    hint: 'collected in June',
  },
]

export const MOCK_FEE_COLLECTION = [
  { month: 'Jan', collected: 820000, target: 950000 },
  { month: 'Feb', collected: 910000, target: 950000 },
  { month: 'Mar', collected: 1040000, target: 1000000 },
  { month: 'Apr', collected: 980000, target: 1050000 },
  { month: 'May', collected: 1120000, target: 1100000 },
  { month: 'Jun', collected: 1180000, target: 1150000 },
]

export const MOCK_ATTENDANCE_TREND = [
  { day: 'Mon', present: 448, absent: 38 },
  { day: 'Tue', present: 461, absent: 25 },
  { day: 'Wed', present: 439, absent: 47 },
  { day: 'Thu', present: 470, absent: 16 },
  { day: 'Fri', present: 431, absent: 55 },
  { day: 'Sat', present: 402, absent: 84 },
]

export type ClassSlot = {
  time: string
  batch: string
  subject: string
  teacher: string
  room: string
  status: 'upcoming' | 'ongoing' | 'done'
}

export const MOCK_TODAYS_CLASSES: ClassSlot[] = [
  { time: '08:00', batch: 'Class 12 — PCM', subject: 'Physics', teacher: 'R. Iyer', room: 'A-101', status: 'done' },
  { time: '10:00', batch: 'Class 11 — PCB', subject: 'Chemistry', teacher: 'S. Nair', room: 'A-102', status: 'ongoing' },
  { time: '12:30', batch: 'Class 10 — Foundation', subject: 'Mathematics', teacher: 'P. Deshpande', room: 'B-201', status: 'upcoming' },
  { time: '15:00', batch: 'NEET Repeater', subject: 'Biology', teacher: 'M. Kulkarni', room: 'B-203', status: 'upcoming' },
  { time: '17:30', batch: 'JEE Advanced', subject: 'Mathematics', teacher: 'A. Verma', room: 'A-105', status: 'upcoming' },
]

export type Activity = {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export const MOCK_ACTIVITY: Activity[] = [
  { id: '1', actor: 'Priya Menon', action: 'paid fees', target: '₹18,000 · Class 12 PCM', time: '12m ago' },
  { id: '2', actor: 'R. Iyer', action: 'marked attendance', target: 'Class 12 — PCM', time: '48m ago' },
  { id: '3', actor: 'System', action: 'generated invoices', target: '38 pending students', time: '2h ago' },
  { id: '4', actor: 'S. Nair', action: 'published results', target: 'Weekly Test 14', time: '4h ago' },
  { id: '5', actor: 'Aditya Rao', action: 'enrolled', target: 'NEET Repeater batch', time: '6h ago' },
]

export type Student = {
  id: string
  name: string
  batch: string
  guardian: string
  phone: string
  feeStatus: 'paid' | 'partial' | 'due'
  attendance: number
}

export const MOCK_STUDENTS: Student[] = [
  { id: 'STU-1042', name: 'Priya Menon', batch: 'Class 12 — PCM', guardian: 'Rajesh Menon', phone: '+91 98200 11223', feeStatus: 'paid', attendance: 96 },
  { id: 'STU-1043', name: 'Aditya Rao', batch: 'NEET Repeater', guardian: 'Sunita Rao', phone: '+91 98200 44556', feeStatus: 'partial', attendance: 88 },
  { id: 'STU-1044', name: 'Kabir Shah', batch: 'JEE Advanced', guardian: 'Imran Shah', phone: '+91 98200 77889', feeStatus: 'due', attendance: 79 },
  { id: 'STU-1045', name: 'Meera Joshi', batch: 'Class 11 — PCB', guardian: 'Anil Joshi', phone: '+91 98200 22110', feeStatus: 'paid', attendance: 93 },
  { id: 'STU-1046', name: 'Rohan Gupta', batch: 'Class 10 — Foundation', guardian: 'Neha Gupta', phone: '+91 98200 33445', feeStatus: 'paid', attendance: 91 },
  { id: 'STU-1047', name: 'Sana Sheikh', batch: 'Class 12 — PCM', guardian: 'Farhan Sheikh', phone: '+91 98200 55667', feeStatus: 'due', attendance: 84 },
  { id: 'STU-1048', name: 'Devansh Patel', batch: 'Class 11 — PCB', guardian: 'Kiran Patel', phone: '+91 98200 88990', feeStatus: 'partial', attendance: 90 },
  { id: 'STU-1049', name: 'Ishita Nair', batch: 'JEE Advanced', guardian: 'Lakshmi Nair', phone: '+91 98200 12345', feeStatus: 'paid', attendance: 97 },
]

export type Teacher = {
  id: string
  name: string
  subject: string
  batches: number
  phone: string
  status: 'active' | 'on leave'
}

export const MOCK_TEACHERS: Teacher[] = [
  { id: 'TCH-201', name: 'Ravi Iyer', subject: 'Physics', batches: 4, phone: '+91 90040 11221', status: 'active' },
  { id: 'TCH-202', name: 'Sneha Nair', subject: 'Chemistry', batches: 3, phone: '+91 90040 33442', status: 'active' },
  { id: 'TCH-203', name: 'Prakash Deshpande', subject: 'Mathematics', batches: 5, phone: '+91 90040 55663', status: 'active' },
  { id: 'TCH-204', name: 'Manisha Kulkarni', subject: 'Biology', batches: 2, phone: '+91 90040 77884', status: 'on leave' },
  { id: 'TCH-205', name: 'Arjun Verma', subject: 'Mathematics', batches: 3, phone: '+91 90040 99005', status: 'active' },
]

export type Batch = {
  id: string
  name: string
  level: string
  students: number
  capacity: number
  teacher: string
  schedule: string
}

export const MOCK_BATCHES: Batch[] = [
  { id: 'BATCH-01', name: 'Class 12 — PCM', level: 'Senior Secondary', students: 42, capacity: 50, teacher: 'R. Iyer', schedule: 'Mon–Sat · 08:00' },
  { id: 'BATCH-02', name: 'Class 11 — PCB', level: 'Senior Secondary', students: 38, capacity: 45, teacher: 'S. Nair', schedule: 'Mon–Sat · 10:00' },
  { id: 'BATCH-03', name: 'Class 10 — Foundation', level: 'Secondary', students: 55, capacity: 60, teacher: 'P. Deshpande', schedule: 'Mon–Fri · 12:30' },
  { id: 'BATCH-04', name: 'NEET Repeater', level: 'Entrance', students: 30, capacity: 35, teacher: 'M. Kulkarni', schedule: 'Mon–Sat · 15:00' },
  { id: 'BATCH-05', name: 'JEE Advanced', level: 'Entrance', students: 28, capacity: 30, teacher: 'A. Verma', schedule: 'Mon–Sat · 17:30' },
]

export type FeeRecord = {
  invoice: string
  student: string
  batch: string
  amount: number
  dueDate: string
  status: 'paid' | 'partial' | 'due'
}

export const MOCK_FEES: FeeRecord[] = [
  { invoice: 'INV-2041', student: 'Priya Menon', batch: 'Class 12 — PCM', amount: 18000, dueDate: '05 Jun 2026', status: 'paid' },
  { invoice: 'INV-2042', student: 'Aditya Rao', batch: 'NEET Repeater', amount: 22000, dueDate: '05 Jun 2026', status: 'partial' },
  { invoice: 'INV-2043', student: 'Kabir Shah', batch: 'JEE Advanced', amount: 25000, dueDate: '28 May 2026', status: 'due' },
  { invoice: 'INV-2044', student: 'Meera Joshi', batch: 'Class 11 — PCB', amount: 16000, dueDate: '05 Jun 2026', status: 'paid' },
  { invoice: 'INV-2045', student: 'Sana Sheikh', batch: 'Class 12 — PCM', amount: 18000, dueDate: '28 May 2026', status: 'due' },
]

export type TestRecord = {
  id: string
  name: string
  batch: string
  subject: string
  date: string
  maxMarks: number
  status: 'scheduled' | 'completed' | 'grading'
}

export const MOCK_TESTS: TestRecord[] = [
  { id: 'TST-014', name: 'Weekly Test 14', batch: 'Class 12 — PCM', subject: 'Physics', date: '02 Jun 2026', maxMarks: 100, status: 'completed' },
  { id: 'TST-015', name: 'Weekly Test 15', batch: 'Class 11 — PCB', subject: 'Chemistry', date: '09 Jun 2026', maxMarks: 100, status: 'grading' },
  { id: 'TST-016', name: 'Mock Test — JEE', batch: 'JEE Advanced', subject: 'Full Syllabus', date: '15 Jun 2026', maxMarks: 300, status: 'scheduled' },
  { id: 'TST-017', name: 'Mock Test — NEET', batch: 'NEET Repeater', subject: 'Full Syllabus', date: '16 Jun 2026', maxMarks: 720, status: 'scheduled' },
]

export type ResultRecord = {
  rank: number
  student: string
  batch: string
  test: string
  score: number
  maxMarks: number
}

export const MOCK_RESULTS: ResultRecord[] = [
  { rank: 1, student: 'Ishita Nair', batch: 'JEE Advanced', test: 'Weekly Test 14', score: 94, maxMarks: 100 },
  { rank: 2, student: 'Priya Menon', batch: 'Class 12 — PCM', test: 'Weekly Test 14', score: 91, maxMarks: 100 },
  { rank: 3, student: 'Meera Joshi', batch: 'Class 11 — PCB', test: 'Weekly Test 14', score: 88, maxMarks: 100 },
  { rank: 4, student: 'Rohan Gupta', batch: 'Class 10 — Foundation', test: 'Weekly Test 14', score: 85, maxMarks: 100 },
  { rank: 5, student: 'Devansh Patel', batch: 'Class 11 — PCB', test: 'Weekly Test 14', score: 82, maxMarks: 100 },
]

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export type TimetableEntry = {
  day: (typeof WEEK_DAYS)[number]
  time: string
  batch: string
  subject: string
}

export const MOCK_TIMETABLE: TimetableEntry[] = [
  { day: 'Mon', time: '08:00', batch: 'Class 12 — PCM', subject: 'Physics' },
  { day: 'Mon', time: '10:00', batch: 'Class 11 — PCB', subject: 'Chemistry' },
  { day: 'Tue', time: '08:00', batch: 'Class 12 — PCM', subject: 'Mathematics' },
  { day: 'Tue', time: '15:00', batch: 'NEET Repeater', subject: 'Biology' },
  { day: 'Wed', time: '12:30', batch: 'Class 10 — Foundation', subject: 'Mathematics' },
  { day: 'Thu', time: '17:30', batch: 'JEE Advanced', subject: 'Physics' },
  { day: 'Fri', time: '10:00', batch: 'Class 11 — PCB', subject: 'Biology' },
  { day: 'Sat', time: '15:00', batch: 'NEET Repeater', subject: 'Chemistry' },
]

export type Announcement = {
  id: string
  title: string
  body: string
  audience: string
  date: string
  pinned: boolean
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ANN-1', title: 'Summer batch timings revised', body: 'From 10 June, morning batches will start 30 minutes earlier. Please plan your commute accordingly.', audience: 'All batches', date: '01 Jun 2026', pinned: true },
  { id: 'ANN-2', title: 'JEE Mock Test schedule released', body: 'The full mock test for JEE Advanced is scheduled for 15 June. Report to A-105 by 8:45 AM.', audience: 'JEE Advanced', date: '30 May 2026', pinned: false },
  { id: 'ANN-3', title: 'Fee reminder for May cycle', body: 'Kindly clear pending fees before 5 June to avoid a late charge.', audience: 'Parents · 38 students', date: '28 May 2026', pinned: false },
]

export type ReportCard = {
  key: string
  title: string
  description: string
  metric: string
  period: string
}

export const MOCK_REPORTS: ReportCard[] = [
  { key: 'collection', title: 'Fee Collection Summary', description: 'Collected vs. outstanding across all batches.', metric: '₹11.8L collected', period: 'June 2026' },
  { key: 'attendance', title: 'Attendance Report', description: 'Average attendance by batch and month.', metric: '92% average', period: 'June 2026' },
  { key: 'academic', title: 'Academic Performance', description: 'Test averages and top performers by batch.', metric: '78% avg score', period: 'Term 2' },
  { key: 'enrollment', title: 'Enrollment Trends', description: 'New admissions and churn over time.', metric: '+24 this month', period: 'Last 6 months' },
]
