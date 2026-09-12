'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, Settings as SettingsIcon, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { findNavItem } from '@/lib/nav'
import type { UserContext } from '@/lib/supabase/user-context'
import { createClient } from '@/lib/supabase/client'
import { NotificationCenter } from '@/components/app/notification-center'

export function AppTopbar({ userContext }: { userContext: UserContext | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const current = findNavItem(pathname)

  async function handleSignOut() {
    const { error } = await createClient().auth.signOut()
    if (error) { toast.error('Unable to sign out. Please try again.'); return }
    toast.success('Signed out')
    router.push('/')
  }

  return <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
    <SidebarTrigger /><Separator orientation="vertical" className="mr-1 h-6" />
    <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink render={<Link href="/dashboard" />}>ClassPilot</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{current?.title ?? 'Dashboard'}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    <div className="ml-auto flex items-center gap-2"><NotificationCenter /><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" className="h-10 gap-2 px-2"><Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{(userContext?.fullName ?? 'User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</AvatarFallback></Avatar><span className="hidden text-left sm:flex sm:flex-col sm:leading-tight"><span className="text-sm font-medium">{userContext?.fullName ?? 'User'}</span><span className="text-xs text-muted-foreground">{userContext?.role ?? 'Member'}</span></span><ChevronsUpDown className="hidden size-4 text-muted-foreground sm:block" /></Button>} /><DropdownMenuContent align="end" className="w-56"><DropdownMenuGroup><DropdownMenuLabel><div className="flex flex-col"><span className="text-sm font-medium">{userContext?.fullName ?? 'User'}</span><span className="text-xs font-normal text-muted-foreground">{userContext?.email ?? ''}</span></div></DropdownMenuLabel></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem render={<Link href="/settings" />}><User />Profile</DropdownMenuItem><DropdownMenuItem render={<Link href="/settings" />}><SettingsIcon />Center settings</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem onClick={handleSignOut} variant="destructive"><LogOut />Sign out</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>
  </header>
}
