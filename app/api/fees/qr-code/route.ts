import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createFeeQrCode, razorpay } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    if (!razorpay) return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 })

    const body = await request.json() as { studentFeeId?: string }
    if (!body.studentFeeId) return NextResponse.json({ error: 'studentFeeId is required.' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle()
    if (!profile?.organization_id) return NextResponse.json({ error: 'No organization found.' }, { status: 403 })

    const admin = getAdminClient()
    const { data: fee } = await admin
      .from('student_fees')
      .select('id, amount, status, organization_id, student_id, students(full_name)')
      .eq('id', body.studentFeeId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()
    if (!fee) return NextResponse.json({ error: 'Fee record not found.' }, { status: 404 })
    if (fee.status === 'paid') return NextResponse.json({ error: 'This fee is already paid.' }, { status: 400 })

    const student = Array.isArray(fee.students) ? fee.students[0] : fee.students
    const qr = await createFeeQrCode({
      amount: fee.amount,
      studentFeeId: fee.id,
      organizationId: fee.organization_id,
      description: `Fee - ${student?.full_name ?? 'student'}`,
    })

    await admin.from('student_fees').update({ razorpay_qr_code_id: qr.id, razorpay_qr_code_image: qr.image_url }).eq('id', fee.id)

    return NextResponse.json({ imageUrl: qr.image_url, id: qr.id })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create QR code.' }, { status: 502 })
  }
}
