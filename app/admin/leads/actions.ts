'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireFounderAdmin, writeFounderAudit } from '@/lib/founder-admin'
import { getAdminClient } from '@/lib/supabase/admin'

function clean(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim()
  return value || null
}

export async function createLead(formData: FormData) {
  const founder = await requireFounderAdmin(); if (!founder) redirect('/login')
  const fullName = String(formData.get('full_name') ?? '').trim(); const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (fullName.length < 2 || fullName.length > 120 || email.length < 3 || email.length > 320 || !email.includes('@')) return
  const admin = getAdminClient(); const { data, error } = await admin.from('sales_leads').insert({ full_name: fullName, email, phone: clean(formData, 'phone'), organization_name: clean(formData, 'organization_name'), organization_type: String(formData.get('organization_type') ?? 'Coaching Center'), city: clean(formData, 'city'), linked_organization_id: clean(formData, 'linked_organization_id'), source: String(formData.get('source') ?? 'website'), status: String(formData.get('status') ?? 'new'), notes: clean(formData, 'notes'), next_step: clean(formData, 'next_step'), next_step_at: clean(formData, 'next_step_at'), created_by: founder.id, updated_by: founder.id }).select('id').single()
  if (error || !data) return
  await admin.from('sales_lead_activities').insert({ lead_id: data.id, activity_type: 'Lead Created', description: `Lead created for ${fullName}.`, created_by: founder.id })
  await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'create_sales_lead', targetType: 'sales_lead', targetId: data.id })
  revalidatePath('/admin/leads')
}

export async function updateLead(formData: FormData) {
  const founder = await requireFounderAdmin(); if (!founder) redirect('/login'); const id = String(formData.get('id') ?? ''); if (!id) return
  const admin = getAdminClient(); const { data: before } = await admin.from('sales_leads').select('status').eq('id', id).maybeSingle()
  const nextStatus = String(formData.get('status') ?? 'new'); const { error } = await admin.from('sales_leads').update({ status: nextStatus, next_step: clean(formData, 'next_step'), next_step_at: clean(formData, 'next_step_at'), notes: clean(formData, 'notes'), updated_by: founder.id }).eq('id', id)
  if (error) return
  if (before?.status !== nextStatus) await admin.from('sales_lead_activities').insert({ lead_id: id, activity_type: 'Status Changed', description: `Status changed from ${before?.status ?? 'unknown'} to ${nextStatus}.`, created_by: founder.id })
  await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'update_sales_lead', targetType: 'sales_lead', targetId: id, metadata: { status: nextStatus } }); revalidatePath('/admin/leads')
}

export async function addActivity(formData: FormData) {
  const founder = await requireFounderAdmin(); if (!founder) redirect('/login'); const leadId = String(formData.get('lead_id') ?? ''); const description = String(formData.get('description') ?? '').trim(); if (!leadId || !description || description.length > 5000) return
  const admin = getAdminClient(); await admin.from('sales_lead_activities').insert({ lead_id: leadId, activity_type: String(formData.get('activity_type') ?? 'General Activity'), description, created_by: founder.id }); await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'add_sales_lead_activity', targetType: 'sales_lead', targetId: leadId }); revalidatePath('/admin/leads')
}

export async function deleteLead(formData: FormData) {
  const founder = await requireFounderAdmin(); if (!founder) redirect('/login'); const id = String(formData.get('id') ?? ''); if (!id) return; const admin = getAdminClient(); const { error } = await admin.from('sales_leads').delete().eq('id', id); if (!error) { await writeFounderAudit({ adminUserId: founder.id, adminEmail: founder.email, action: 'delete_sales_lead', targetType: 'sales_lead', targetId: id }); revalidatePath('/admin/leads') }
}
