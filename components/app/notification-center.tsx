'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

type Notification = { id: string; type: string; title: string; message: string; related_id: string | null; read_at: string | null; created_at: string }

function destination(notification: Notification, portal: boolean) {
  const prefix = portal ? '/portal' : ''
  if (notification.type === 'announcement') return `${prefix}/announcements`
  if (notification.type === 'test_result') return `${prefix}/results`
  if (notification.type === 'timetable') return `${prefix}/timetable`
  if (notification.type === 'fee') return `${prefix}/fees`
  if (notification.type === 'batch') return portal ? '/portal' : '/batches'
  return portal ? '/portal' : '/dashboard'
}

export function NotificationCenter({ portal = false }: { portal?: boolean }) {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('notifications').select('id,type,title,message,related_id,read_at,created_at').order('created_at', { ascending: false }).limit(8)
    if (error) { toast.error('Unable to load notifications'); return }
    setItems((data ?? []) as Notification[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { void load() }, [load])

  const unread = items.filter((item) => !item.read_at).length
  async function markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error('Unable to update notification'); return }
    setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
  }
  async function markAllRead() {
    const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
    if (error) { toast.error('Unable to mark notifications read'); return }
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })))
  }

  return <DropdownMenu onOpenChange={(open) => { if (open) void load() }}>
    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={unread ? `${unread} unread notifications` : 'Notifications'} className="relative" />}><Bell className="size-4" />{unread > 0 && <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{unread > 9 ? '9+' : unread}</span>}</DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
      <DropdownMenuLabel className="flex items-center justify-between px-4 py-3"><span>Notifications</span>{unread > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck className="size-3.5" />Mark all read</Button>}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {loading ? <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading notifications…</div> : items.length === 0 ? <div className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</div> : <div className="max-h-96 overflow-y-auto">{items.map((item) => <DropdownMenuItem key={item.id} className="items-start gap-3 whitespace-normal px-4 py-3" onClick={() => { if (!item.read_at) void markRead(item.id) }}><span className={`mt-1 size-2 shrink-0 rounded-full ${item.read_at ? 'bg-muted' : 'bg-primary'}`} /><span className="min-w-0 flex-1"><span className="block font-medium">{item.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.message}</span><span className="mt-1 block text-[11px] text-muted-foreground">{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</span></span><Link href={destination(item, portal)} aria-label={`Open ${item.title}`} onClick={(event) => event.stopPropagation()} className="mt-1 text-muted-foreground hover:text-foreground"><ExternalLink className="size-3.5" /></Link></DropdownMenuItem>)}</div>}
    </DropdownMenuContent>
  </DropdownMenu>
}
