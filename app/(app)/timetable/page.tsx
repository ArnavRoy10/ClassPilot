"use client"

import * as React from "react"
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const
type Day = (typeof WEEK_DAYS)[number]
type Schedule = { id: string; batch_id: string; teacher_id: string; subject: string; day_of_week: Day; start_time: string; end_time: string; room: string | null; notes: string | null; batch?: { name: string } | null; teacher?: { full_name: string } | null }
type FormState = { id?: string; batchId: string; teacherId: string; subject: string; day: Day; startTime: string; endTime: string; room: string; notes: string }
type Option = { id: string; name?: string; full_name?: string }
const emptyForm: FormState = { batchId: "", teacherId: "", subject: "", day: "Monday", startTime: "09:00", endTime: "10:00", room: "", notes: "" }

function formatTime(value: string) { const [hours, minutes] = value.slice(0, 5).split(":").map(Number); return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}` }

export default function TimetablePage() {
  const supabase = React.useMemo(() => createClient(), [])
  const [organizationId, setOrganizationId] = React.useState<string | null>(null)
  const [schedules, setSchedules] = React.useState<Schedule[]>([])
  const [batches, setBatches] = React.useState<Option[]>([])
  const [teachers, setTeachers] = React.useState<Option[]>([])
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)
    const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()
    if (!profile?.organization_id) return setLoading(false)
    setOrganizationId(profile.organization_id)
    const [{ data: scheduleData, error }, { data: batchData }, { data: teacherData }] = await Promise.all([
      supabase.from("schedules").select("id,batch_id,teacher_id,subject,day_of_week,start_time,end_time,room,notes,batch:batches(name),teacher:teachers(full_name)").order("day_of_week").order("start_time"),
      supabase.from("batches").select("id,name").order("name"),
      supabase.from("teachers").select("id,full_name").order("full_name"),
    ])
    if (error) toast.error("Could not load the timetable")
    setSchedules((scheduleData ?? []) as Schedule[]); setBatches(batchData ?? []); setTeachers(teacherData ?? []); setLoading(false)
  }, [supabase])
  React.useEffect(() => { void loadData() }, [loadData])
  const update = (field: keyof FormState, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  const openEdit = (entry: Schedule) => { setForm({ id: entry.id, batchId: entry.batch_id, teacherId: entry.teacher_id, subject: entry.subject, day: entry.day_of_week, startTime: entry.start_time?.slice(0, 5) ?? '', endTime: entry.end_time?.slice(0, 5) ?? '', room: entry.room ?? "", notes: entry.notes ?? "" }); setOpen(true) }
  async function saveSchedule(event: React.FormEvent) { event.preventDefault(); if (!organizationId || !form.batchId || !form.teacherId || !form.subject.trim() || form.endTime <= form.startTime) return toast.error("Complete the fields and choose a valid time range"); setSaving(true); const payload = { organization_id: organizationId, batch_id: form.batchId, teacher_id: form.teacherId, subject: form.subject.trim(), day_of_week: form.day, start_time: form.startTime, end_time: form.endTime, room: form.room.trim() || null, notes: form.notes.trim() || null }; const result = form.id ? await supabase.from("schedules").update(payload).eq("id", form.id) : await supabase.from("schedules").insert(payload); setSaving(false); if (result.error) return toast.error("Could not save this class"); toast.success(form.id ? "Class updated" : "Class added"); setOpen(false); await loadData() }
  async function removeSchedule(id: string) { if (!window.confirm("Delete this class from the timetable?")) return; const { error } = await supabase.from("schedules").delete().eq("id", id); if (error) toast.error("Could not delete this class"); else { toast.success("Class removed"); await loadData() } }

  return <div className="flex flex-col gap-6">
    <PageHeader title="Timetable" description="Manage the weekly schedule for every class group." actions={<Button onClick={openCreate}><Plus data-icon="inline-start" />Add class</Button>} />
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground"><CalendarDays className="size-4 text-primary" />Changes are saved to your organization timetable.</div>
    {open && <Card><CardHeader><CardTitle>{form.id ? "Edit class" : "Add class"}</CardTitle><p className="text-sm text-muted-foreground">Assign a teacher, batch, and time slot for this class.</p></CardHeader><CardContent><form onSubmit={saveSchedule} className="flex flex-col gap-4"><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="Mathematics" required /></div><div className="flex flex-col gap-2"><Label>Day</Label><Select value={form.day} onValueChange={(value) => update("day", value as Day)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{WEEK_DAYS.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label>Batch</Label><Select value={form.batchId} onValueChange={(value) => update("batchId", value ?? '')}><SelectTrigger className="w-full"><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{batches.map((batch) => <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>)}</SelectContent></Select></div><div className="flex flex-col gap-2"><Label>Teacher</Label><Select value={form.teacherId} onValueChange={(value) => update("teacherId", value ?? '')}><SelectTrigger className="w-full"><SelectValue placeholder="Select teacher" /></SelectTrigger><SelectContent>{teachers.map((teacher) => <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="start-time">Start time</Label><Input id="start-time" type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} /></div><div className="flex flex-col gap-2"><Label htmlFor="end-time">End time</Label><Input id="end-time" type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} /></div></div><div className="flex flex-col gap-2"><Label htmlFor="room">Room (optional)</Label><Input id="room" value={form.room} onChange={(e) => update("room", e.target.value)} placeholder="Room 204" /></div><div className="flex flex-col gap-2"><Label htmlFor="notes">Notes (optional)</Label><Input id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Bring practice worksheets" /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save class"}</Button></div></form></CardContent></Card>}
    {loading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{WEEK_DAYS.map((day) => <Card key={day}><CardHeader><CardTitle className="text-base">{day}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Loading…</p></CardContent></Card>)}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{WEEK_DAYS.map((day) => { const entries = schedules.filter((entry) => entry.day_of_week === day); return <Card key={day}><CardHeader><CardTitle className="text-base">{day}</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">{entries.map((entry) => <div key={entry.id} className="group rounded-lg border bg-muted/30 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-xs text-primary">{formatTime(entry.start_time ?? '')} – {formatTime(entry.end_time ?? '')}</p><p className="mt-1 text-sm font-medium">{entry.subject}</p><p className="text-xs text-muted-foreground">{entry.batch?.name ?? "Batch"} · {entry.teacher?.full_name ?? "Teacher"}</p>{entry.room && <p className="mt-1 text-xs text-muted-foreground">Room {entry.room}</p>}</div><div className="flex gap-1 opacity-70 transition-opacity group-hover:opacity-100"><Button variant="ghost" size="icon" aria-label={`Edit ${entry.subject}`} onClick={() => openEdit(entry)}><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${entry.subject}`} onClick={() => void removeSchedule(entry.id)}><Trash2 /></Button></div></div></div>)}{entries.length === 0 && <p className="text-sm text-muted-foreground">No classes scheduled.</p>}</CardContent></Card> })}</div>}
  </div>
}
