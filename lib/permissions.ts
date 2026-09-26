// Defines the "powers" an owner can grant to a teacher or student login.
// Stored as a JSON object (permission key -> boolean) on the teachers/students row.

export const TEACHER_POWERS = [
  { key: 'manage_students', label: 'Manage students', description: 'Add, edit, and remove student records.' },
  { key: 'manage_batches', label: 'Manage batches', description: 'Create and edit batches, assign students.' },
  { key: 'manage_attendance', label: 'Take attendance', description: 'Mark and edit attendance for classes.' },
  { key: 'manage_tests_results', label: 'Tests & results', description: 'Create tests and publish results.' },
  { key: 'manage_timetable', label: 'Manage timetable', description: 'Edit class schedules.' },
  { key: 'manage_fees', label: 'Manage fees', description: 'View and update student fee records.' },
  { key: 'send_communications', label: 'Send communications', description: 'Send announcements and messages.' },
  { key: 'view_reports', label: 'View reports', description: 'See center-wide reports and analytics.' },
] as const

export type TeacherPowerKey = (typeof TEACHER_POWERS)[number]['key']

export const STUDENT_POWERS = [
  { key: 'view_attendance', label: 'View attendance', description: 'See their own attendance record.' },
  { key: 'view_results', label: 'View results', description: 'See published test results.' },
  { key: 'view_timetable', label: 'View timetable', description: 'See their class schedule.' },
  { key: 'view_fees', label: 'View fees', description: 'See their fee status and dues.' },
  { key: 'view_announcements', label: 'View announcements', description: 'See center announcements.' },
] as const

export type StudentPowerKey = (typeof STUDENT_POWERS)[number]['key']

export type Permissions = Record<string, boolean>

export function emptyPermissions(powers: readonly { key: string }[]): Permissions {
  return Object.fromEntries(powers.map((power) => [power.key, false]))
}

export function normalizePermissions(
  powers: readonly { key: string }[],
  value: unknown,
): Permissions {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return Object.fromEntries(powers.map((power) => [power.key, Boolean(source[power.key])]))
}
