'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Logo } from '@/components/brand/logo'
import { appNav } from '@/lib/nav'
import type { UserContext } from '@/lib/supabase/user-context'

export function AppSidebar({ userContext }: { userContext: UserContext | null }) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1.5">
          <Logo />
        </div>
        <div className="rounded-md bg-sidebar-accent px-2 py-1.5 text-xs">
          <p className="font-medium text-sidebar-accent-foreground">{userContext?.organization.name ?? 'Your organization'}</p>
          <p className="text-muted-foreground">{userContext ? `${userContext.organization.plan} plan · ${userContext.organization.type === 'solo_tutor' ? 'Solo tutor' : 'Coaching center'}` : 'Loading workspace'}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {appNav.map((group) => {
          const items = group.items.filter((item) => !(item.href === '/teachers' && userContext?.organization.type === 'solo_tutor'))
          if (items.length === 0) return null
          return (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="px-2 py-1 text-xs text-muted-foreground">
          ClassPilot · Preview build
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
