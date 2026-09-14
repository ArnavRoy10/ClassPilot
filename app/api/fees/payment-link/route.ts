import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createFeePaymentLink, razorpay } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    if (!razorpay) return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 })

    const body = await request.json() as { studentFeeId?: string }
    if (!body.studentFeeId) return NextResponse.json({ error: 'studentFeeId is required.' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).maybeSingle()
    if (!profile?.organization_id) return NextResponse.json({ error: 'No organization found.' }, { status: 403 })

    const admin = getAdminClient()
    const { data: fee } = await admin
      .from('student_fees')
      .select('id, amount, status, organization_id, student_id, students(full_name, guardian_name, guardian_phone)')
      .eq('id', body.studentFeeId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()
    if (!fee) return NextResponse.json({ error: 'Fee record not found.' }, { status: 404 })
    if (fee.status === 'paid') return NextResponse.json({ error: 'This fee is already paid.' }, { status: 400 })

    const student = Array.isArray(fee.students) ? fee.students[0] : fee.students
    const link = await createFeePaymentLink({
      amount: fee.amount,
      studentFeeId: fee.id,
      organizationId: fee.organization_id,
      description: `Fee payment for ${student?.full_name ?? 'student'}`,
      customerName: student?.guardian_name ?? student?.full_name ?? undefined,
      customerPhone: student?.guardian_phone ?? undefined,
    })

    await admin.from('student_fees').update({ razorpay_payment_link_id: link.id, razorpay_payment_link_url: link.short_url }).eq('id', fee.id)

    return NextResponse.json({ url: link.short_url, id: link.id })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create payment link.' }, { status: 502 })
  }
}
