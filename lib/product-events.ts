import type { SupabaseClient } from '@supabase/supabase-js'

export type ProductEventName =
  | 'workspace_created'
  | 'first_login'
  | 'student_created'
  | 'teacher_created'
  | 'batch_created'
  | 'attendance_recorded'
  | 'fee_record_created'
  | 'test_created'
  | 'result_recorded'
  | 'portal_link_created'
  | 'subscription_started'
  | 'subscription_canceled'

export async function trackProductEvent(
  supabase: SupabaseClient,
  eventName: ProductEventName,
  options: { eventKey?: string; metadata?: Record<string, string | number | boolean | null> } = {},
) {
  const [{ data: userData }, { data: organizationId }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc('current_user_organization_id'),
  ])

  if (!userData.user || !organizationId) return

  await supabase.from('product_events').insert({
    organization_id: organizationId,
    actor_user_id: userData.user.id,
    event_name: eventName,
    event_key: options.eventKey ?? null,
    metadata: options.metadata ?? {},
  })
}
