'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, CalendarCheck, BarChart3, CalendarDays, Megaphone, Wallet, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationCenter } from '@/components/app/notification-center'

const items = [
  ['Overview', '/portal', LayoutDashboard],
  ['Profile', '/portal/profile', User],
  ['Attendance', '/portal/attendance', CalendarCheck],
  ['Results', '/portal/results', BarChart3],
  ['Timetable', '/portal/timetable', CalendarDays],
  ['Announcements', '/portal/announcements', Megaphone],
  ['Fees', '/portal/fees', Wallet],
] as const

export function PortalShell({ children, name, role }: { children: React.ReactNode; name: string; role: string }) {
  const pathname = usePathname()
  async function signOut() { await createClient().auth.signOut(); window.location.href = '/login' }
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><Link href="/portal" className="font-display text-lg font-bold text-primary">ClassPilot <span className="font-sans text-xs font-medium text-muted-foreground">Portal</span></Link><div className="flex items-center gap-2"><NotificationCenter portal /><span className="hidden text-sm text-muted-foreground sm:inline">{name} · {role}</span><button onClick={signOut} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><LogOut className="size-4" /> Sign out</button></div></div></header>
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row"><aside className="w-full shrink-0 lg:w-56"><nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">{items.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="size-4" />{label}</Link>)}</nav></aside><main className="min-w-0 flex-1">{children}</main></div>
  </div>
}

export function PortalHeader({ title, description }: { title: string; description: string }) { return <div className="mb-6"><h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div> }

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) { return <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div> }

export function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{text}</div> }

export function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value)) : '—' }
export function formatTime(value?: string | null) { return value ? value.slice(0, 5) : '—' }
export function money(value: number) { return `₹${value.toLocaleString('en-IN')}` }

export function PortalTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { return <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full text-left text-sm"><thead className="border-b border-border bg-muted/40"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium text-muted-foreground">{header}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top">{cell}</td>)}</tr>)}</tbody></table></div> }

export function StatusPill({ children }: { children: React.ReactNode }) { return <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{children}</span> }
