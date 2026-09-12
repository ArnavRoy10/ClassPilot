'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { LifeBuoy, MessageSquare, Plus, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

type Ticket = { id: string; subject: string; type: string; priority: string; status: string; description: string; created_at: string; updated_at: string }
type Message = { id: string; body: string; author_user_id: string | null; created_at: string; is_internal: boolean }

const supabase = createClient()

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('other')
  const [reply, setReply] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase.from('support_tickets').select('id,subject,type,priority,status,description,created_at,updated_at').order('updated_at', { ascending: false })
    if (error) { toast.error('Unable to load support tickets'); return }
    setTickets((data ?? []) as Ticket[])
  }, [])

  useEffect(() => { void loadTickets() }, [loadTickets])

  async function openTicket(ticket: Ticket) {
    setSelected(ticket)
    const { data, error } = await supabase.from('support_messages').select('id,body,author_user_id,created_at,is_internal').eq('ticket_id', ticket.id).order('created_at')
    if (error) toast.error('Unable to load conversation')
    else setMessages((data ?? []) as Message[])
  }

  async function createTicket(event: FormEvent) {
    event.preventDefault()
    if (subject.trim().length < 3 || description.trim().length < 10) { toast.error('Add a subject and a little more detail'); return }
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    const { data: profile } = user ? await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle() : { data: null }
    if (!user || !profile?.organization_id) { toast.error('Your workspace could not be identified'); setSaving(false); return }
    const { data, error } = await supabase.from('support_tickets').insert({ organization_id: profile.organization_id, created_by: user.id, type, subject: subject.trim(), description: description.trim() }).select('id,subject,type,priority,status,description,created_at,updated_at').single()
    if (error) toast.error('Unable to create ticket')
    else { toast.success('Support ticket created'); setSubject(''); setDescription(''); setShowForm(false); await loadTickets(); if (data) setSelected(data as Ticket) }
    setSaving(false)
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault()
    if (!selected || !reply.trim()) return
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const { error } = await supabase.from('support_messages').insert({ ticket_id: selected.id, author_user_id: userData.user?.id, body: reply.trim(), is_internal: false })
    if (error) toast.error('Unable to send reply')
    else { setReply(''); await openTicket(selected); await loadTickets() }
    setSaving(false)
  }

  return <main className="flex min-h-full flex-col gap-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-primary">Support center</p><h1 className="text-3xl font-semibold tracking-tight">How can we help?</h1><p className="mt-1 text-muted-foreground">Ask a question, report a problem, or share an idea with the ClassPilot team.</p></div><Button onClick={() => setShowForm((value) => !value)}><Plus className="size-4" />New ticket</Button></header>
    {showForm && <Card><CardHeader><CardTitle>Start a conversation</CardTitle></CardHeader><CardContent><form onSubmit={createTicket} className="grid gap-4"><div className="grid gap-2"><label htmlFor="ticket-subject" className="text-sm font-medium">Subject</label><Input id="ticket-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="What do you need help with?" /></div><div className="grid gap-2"><label htmlFor="ticket-type" className="text-sm font-medium">Topic</label><select id="ticket-type" value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="bug">Something is not working</option><option value="billing">Billing</option><option value="feature_request">Feature idea</option><option value="account">Account</option><option value="other">Other</option></select></div><div className="grid gap-2"><label htmlFor="ticket-description" className="text-sm font-medium">Details</label><Textarea id="ticket-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} rows={5} placeholder="Include the steps, screen, or question that will help us respond." /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button disabled={saving}>{saving ? 'Creating…' : 'Create ticket'}</Button></div></form></CardContent></Card>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><Card><CardHeader><CardTitle className="flex items-center gap-2"><LifeBuoy className="size-4 text-primary" />Your tickets</CardTitle></CardHeader><CardContent className="grid gap-2">{tickets.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No tickets yet.</div> : tickets.map((ticket) => <button key={ticket.id} onClick={() => void openTicket(ticket)} className={`rounded-lg border p-3 text-left transition-colors hover:bg-muted/60 ${selected?.id === ticket.id ? 'border-primary bg-primary/5' : 'border-border'}`}><div className="flex items-start justify-between gap-3"><span className="font-medium">{ticket.subject}</span><span className="rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize">{ticket.status.replaceAll('_', ' ')}</span></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ticket.description}</p></button>)}</CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="size-4 text-primary" />Conversation</CardTitle></CardHeader><CardContent>{!selected ? <div className="py-16 text-center text-sm text-muted-foreground">Select a ticket to view the conversation.</div> : <div className="grid gap-4"><div className="rounded-lg bg-muted/50 p-4"><p className="font-medium">{selected.subject}</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{selected.description}</p></div><div className="grid gap-3">{messages.map((message) => <div key={message.id} className="rounded-lg border p-3 text-sm"><p className="whitespace-pre-wrap">{message.body}</p><p className="mt-2 text-xs text-muted-foreground">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(message.created_at))}</p></div>)}</div><form onSubmit={sendReply} className="flex gap-2"><Input value={reply} onChange={(event) => setReply(event.target.value)} maxLength={5000} placeholder="Write a reply…" /><Button size="icon" aria-label="Send reply" disabled={saving || !reply.trim()}><Send className="size-4" /></Button></form></div>}</CardContent></Card></div>
  </main>
}
