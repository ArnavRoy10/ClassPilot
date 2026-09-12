import { createClient } from '@/lib/supabase/server'

export type UserContext = {
  userId: string
  fullName: string
  email: string
  role: string
  organization: {
    id: string
    name: string
    type: string
    plan: string
    maxTeachers: number
    maxStudents: number
  }
}

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, organization_id, organizations(id, name, type, plan, max_teachers, max_students)')
    .eq('id', user.id)
    .maybeSingle()

  const organization = Array.isArray(profile?.organizations)
    ? profile.organizations[0]
    : profile?.organizations

  if (!profile || !organization) return null

  return {
    userId: user.id,
    fullName: profile.full_name,
    email: profile.email || user.email || '',
    role: profile.role,
    organization: {
      id: organization.id,
      name: organization.name,
      type: organization.type,
      plan: organization.plan,
      maxTeachers: organization.max_teachers,
      maxStudents: organization.max_students,
    },
  }
}
