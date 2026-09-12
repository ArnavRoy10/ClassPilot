'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Plus, Receipt, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/app/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/app/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'

type Student = { id: string; full_name: string; student_code: string }
type FeePlan = { id: string; name: string; amount: number; frequency: string; status: string }
type StudentFee = { id: string; student_id: string; fee_plan_id: string; amount: number; due_date: string; status: 'paid' | 'pending' | 'partially_paid' | 'overdue' }
type Payment = { student_fee_id: string; amount: number }
type FormState = { student_id: string; fee_plan_id: string; amount: string; due_date: string }
type PlanForm = { name: string; amount: string; frequency: string; description: string }

const emptyFee: FormState = { student_id: '', fee_plan_id: '', amount: '', due_date: '' }
const emptyPlan: PlanForm = { name: '', amount: '', frequency: 'monthly', description: '' }
const frequencyLabel: Record<string, string> = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly', one_time: 'One-time' }

export default function FeesPage() {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>([])
  const [plans, setPlans] = useState<FeePlan[]>([])
  const [fees, setFees] = useState<StudentFee[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [studentNames, setStudentNames] = useState<Record<string, string>>({})
  const [planNames, setPlanNames] = useState<Record<string, string>>({})
  const [feeForm, setFeeForm] = useState<FormState>(emptyFee)
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlan)
  const [openFee, setOpenFee] = useState(false)
  const [openPlan, setOpenPlan] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    const [studentResult, planResult, feeResult, paymentResult] = await Promise.all([
      supabase.from('students').select('id, full_name, student_code').order('full_name'),
      supabase.from('fee_plans').select('id, name, amount, frequency, status').order('created_at', { ascending: false }),
      supabase.from('student_fees').select('id, student_id, fee_plan_id, amount, due_date, status').order('due_date', { ascending: true }),
      supabase.from('payments').select('student_fee_id, amount'),
    ])
    if (studentResult.error || planResult.error || feeResult.error || paymentResult.error) toast.error('Unable to load fee data')
    const nextStudents = (studentResult.data ?? []) as Student[]
    const nextPlans = (planResult.data ?? []) as FeePlan[]
    setStudents(nextStudents)
    setPlans(nextPlans)
    setFees((feeResult.data ?? []) as StudentFee[])
    setPayments((paymentResult.data ?? []) as Payment[])
    setStudentNames(Object.fromEntries(nextStudents.map((student) => [student.id, `${student.full_name} (${student.student_code})`])))
    setPlanNames(Object.fromEntries(nextPlans.map((plan) => [plan.id, plan.name])))
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const collected = useMemo(() => payments.reduce((sum, payment) => sum + Number(payment.amount), 0), [payments])
  const pending = useMemo(() => fees.filter((fee) => fee.status !== 'paid').reduce((sum, fee) => sum + Number(fee.amount), 0) - payments.reduce((sum, payment) => sum + Number(payment.amount), 0), [fees, payments])
  const overdue = fees.filter((fee) => fee.status === 'overdue').length

  function selectPlan(id: string) {
    const plan = plans.find((item) => item.id === id)
    setFeeForm((current) => ({ ...current, fee_plan_id: id, amount: plan ? String(plan.amount) : current.amount }))
  }

  async function createPlan(event: React.FormEvent) {
    event.preventDefault()
    const amount = Number(planForm.amount)
    if (planForm.name.trim().length < 2 || !Number.isFinite(amount) || amount <= 0) { toast.error('Enter a valid plan name and amount'); return }
    setSaving(true)
    const organization = await supabase.rpc('current_user_organization_id')
    const result = organization.data ? await supabase.from('fee_plans').insert({ organization_id: organization.data, name: planForm.name.trim(), amount, frequency: planForm.frequency, description: planForm.description.trim() || null }).select().single() : { error: organization.error }
    if (result.error) toast.error(result.error.code === '42501' ? 'Only owners and admins can manage fee plans' : 'Unable to create fee plan')
    else { toast.success('Fee plan created'); setPlanForm(emptyPlan); setOpenPlan(false); await loadData() }
    setSaving(false)
  }

  async function createFee(event: React.FormEvent) {
    event.preventDefault()
    const amount = Number(feeForm.amount)
    if (!feeForm.student_id || !feeForm.fee_plan_id || !feeForm.due_date || !Number.isFinite(amount) || amount <= 0) { toast.error('Complete all invoice fields'); return }
    setSaving(true)
    const organization = await supabase.rpc('current_user_organization_id')
    const result = organization.data ? await supabase.from('student_fees').insert({ organization_id: organization.data, student_id: feeForm.student_id, fee_plan_id: feeForm.fee_plan_id, amount, due_date: feeForm.due_date }).select().single() : { error: organization.error }
    if (result.error) toast.error(result.error.code === '42501' ? 'Only owners and admins can create invoices' : 'Unable to create invoice')
    else { toast.success('Invoice created'); setFeeForm(emptyFee); setOpenFee(false); await loadData() }
    setSaving(false)
  }

  function exportFees() {
    const csv = ['Student,Plan,Amount,Due date,Status', ...fees.map((fee) => [studentNames[fee.student_id], planNames[fee.fee_plan_id], fee.amount, fee.due_date, fee.status].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'classpilot-fees.csv'; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Fees" description="Manage fee plans, invoices, payments and outstanding dues." actions={<><Button variant="outline" onClick={exportFees}><Download data-icon="inline-start" />Export</Button><Button variant="outline" onClick={() => setOpenPlan((value) => !value)}><Plus data-icon="inline-start" />Fee plan</Button><Button onClick={() => setOpenFee((value) => !value)}><Plus data-icon="inline-start" />Create invoice</Button></>} />
    {openPlan && <Card><CardHeader><CardTitle>Create fee plan</CardTitle><CardDescription>Plans are visible only to your organization&apos;s owners and admins.</CardDescription></CardHeader><CardContent><form onSubmit={createPlan} className="grid gap-4 sm:grid-cols-4"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="plan-name">Plan name</Label><Input id="plan-name" value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="plan-amount">Amount</Label><Input id="plan-amount" type="number" min="1" step="0.01" value={planForm.amount} onChange={(event) => setPlanForm({ ...planForm, amount: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="plan-frequency">Frequency</Label><select id="plan-frequency" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={planForm.frequency} onChange={(event) => setPlanForm({ ...planForm, frequency: event.target.value })}>{Object.entries(frequencyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex gap-2 sm:col-span-4"><Button disabled={saving} type="submit">{saving && <Loader2 className="animate-spin" data-icon="inline-start" />}Create plan</Button><Button type="button" variant="outline" onClick={() => setOpenPlan(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    {openFee && <Card><CardHeader><CardTitle>Create invoice</CardTitle><CardDescription>Assign a fee plan to a student and set the due date.</CardDescription></CardHeader><CardContent><form onSubmit={createFee} className="grid gap-4 sm:grid-cols-4"><div className="grid gap-2 sm:col-span-2"><Label htmlFor="fee-student">Student</Label><select id="fee-student" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={feeForm.student_id} onChange={(event) => setFeeForm({ ...feeForm, student_id: event.target.value })} required><option value="">Select student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.full_name} ({student.student_code})</option>)}</select></div><div className="grid gap-2"><Label htmlFor="fee-plan">Fee plan</Label><select id="fee-plan" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={feeForm.fee_plan_id} onChange={(event) => selectPlan(event.target.value)} required><option value="">Select plan</option>{plans.filter((plan) => plan.status === 'active').map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · ₹{Number(plan.amount).toLocaleString('en-IN')}</option>)}</select></div><div className="grid gap-2"><Label htmlFor="fee-amount">Amount</Label><Input id="fee-amount" type="number" min="1" step="0.01" value={feeForm.amount} onChange={(event) => setFeeForm({ ...feeForm, amount: event.target.value })} required /></div><div className="grid gap-2"><Label htmlFor="fee-due">Due date</Label><Input id="fee-due" type="date" value={feeForm.due_date} onChange={(event) => setFeeForm({ ...feeForm, due_date: event.target.value })} required /></div><div className="flex gap-2 sm:col-span-4"><Button disabled={saving} type="submit">{saving && <Loader2 className="animate-spin" data-icon="inline-start" />}Create invoice</Button><Button type="button" variant="outline" onClick={() => setOpenFee(false)}><X data-icon="inline-start" />Cancel</Button></div></form></CardContent></Card>}
    <div className="grid gap-4 md:grid-cols-3">{([{ label: 'Collected', value: `₹${collected.toLocaleString('en-IN')}`, Icon: Wallet }, { label: 'Outstanding', value: `₹${Math.max(pending, 0).toLocaleString('en-IN')}`, Icon: Receipt }, { label: 'Overdue invoices', value: String(overdue), Icon: Receipt }]).map(({ label, value, Icon }) => <Card key={label}><div className="flex items-center gap-3 p-5"><Icon className="size-5 text-primary" /><div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div></div></Card>)}</div>
    <Card><CardHeader><CardTitle>Fee plans</CardTitle><CardDescription>{plans.length} plans configured for your organization.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className="rounded-lg border bg-muted/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{plan.name}</p><p className="text-sm text-muted-foreground">{frequencyLabel[plan.frequency] ?? plan.frequency}</p></div><StatusBadge status={plan.status} /></div><p className="mt-3 text-xl font-semibold">₹{Number(plan.amount).toLocaleString('en-IN')}</p></div>)}{plans.length === 0 && <p className="text-sm text-muted-foreground">No fee plans yet. Create one to issue invoices.</p>}</CardContent></Card>
    {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" />Loading fee records…</div> : <Card className="overflow-hidden p-0"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Due date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{fees.map((fee) => <TableRow key={fee.id}><TableCell className="font-medium">{studentNames[fee.student_id] ?? 'Unknown student'}</TableCell><TableCell className="text-muted-foreground">{planNames[fee.fee_plan_id] ?? 'Unknown plan'}</TableCell><TableCell>₹{Number(fee.amount).toLocaleString('en-IN')}</TableCell><TableCell>{fee.due_date}</TableCell><TableCell><StatusBadge status={fee.status === 'partially_paid' ? 'pending' : fee.status} /></TableCell></TableRow>)}{fees.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No invoices yet.</TableCell></TableRow>}</TableBody></Table></Card>}
  </div>
}

