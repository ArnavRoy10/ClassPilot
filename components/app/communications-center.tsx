'use client'

import { useEffect, useState } from 'react'
import { Mail, MessageSquare, Send, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

type Channel = 'email' | 'whatsapp' | 'sms'
type Template = { id: string; name: string; channel: Channel; subject: string | null; body: string }

const channelMeta = {
  email: { label: 'Email', icon: Mail },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare },
  sms: { label: 'SMS', icon: Send },
}

export function CommunicationsCenter() {
  const [channel, setChannel] = useState<Channel>('email')
  const [recipientType, setRecipientType] = useState('all_students')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/communications/templates').then((response) => response.ok ? response.json() : { templates: [] }).then((data) => setTemplates(data.templates ?? []))
  }, [])

  async function sendMessage() {
    if (body.trim().length < 2 || (channel === 'email' && subject.trim().length < 2)) {
      toast.error(channel === 'email' ? 'Add a subject and message.' : 'Add a message.')
      return
    }
    setSending(true)
    const response = await fetch('/api/communications/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ channel, recipientType, subject, body }) })
    const data = await response.json()
    setSending(false)
    if (!response.ok) { toast.error(data.error ?? 'Unable to queue message.'); return }
    toast.success(`Message queued for ${data.recipientCount} recipient${data.recipientCount === 1 ? '' : 's'}.`)
    setBody('')
    setSubject('')
  }

  function applyTemplate(template: Template) {
    setChannel(template.channel)
    setSubject(template.subject ?? '')
    setBody(template.body)
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Operations</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Communication Center</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Send polished updates to students, parents, teachers, or an entire batch from one organized workspace.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Compose message</CardTitle>
            <CardDescription>Messages are queued with organization-scoped recipients.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2"><Label>Channel</Label><Select value={channel} onValueChange={(value) => setChannel(value as Channel)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(channelMeta).map(([value, meta]) => <SelectItem key={value} value={value}>{meta.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex flex-col gap-2"><Label>Recipients</Label><Select value={recipientType} onValueChange={(value) => value && setRecipientType(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all_students">All students</SelectItem><SelectItem value="all_teachers">All teachers</SelectItem><SelectItem value="students">Students</SelectItem><SelectItem value="parent">Parents</SelectItem><SelectItem value="teacher">Teachers</SelectItem></SelectContent></Select></div>
            </div>
            {channel === 'email' && <div className="flex flex-col gap-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Important update for your next class" maxLength={160} /></div>}
            <div className="flex flex-col gap-2"><div className="flex items-center justify-between"><Label htmlFor="message">Message</Label><span className="text-xs text-muted-foreground">{body.length}/10,000</span></div><Textarea id="message" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your announcement..." maxLength={10000} className="min-h-48 resize-y" /></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-xs text-muted-foreground">Email delivery uses your connected Resend account.</p><Button onClick={sendMessage} disabled={sending}><Send />{sending ? 'Queueing...' : 'Send message'}</Button></div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle>Saved templates</CardTitle><CardDescription>Reuse your most common updates.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3">{templates.length ? templates.map((template) => { const Icon = channelMeta[template.channel].icon; return <button key={template.id} type="button" onClick={() => applyTemplate(template)} className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"><span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{template.name}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{template.body}</span></span><Badge variant="secondary">{template.channel}</Badge></button> }) : <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center"><FileText className="size-5 text-muted-foreground" /><p className="text-sm font-medium">No templates yet</p><p className="text-xs leading-5 text-muted-foreground">Owners and admins can add templates from the Templates area.</p></div>}</CardContent>
        </Card>
      </div>
    </main>
  )
}
