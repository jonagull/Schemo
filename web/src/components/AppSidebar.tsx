'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LogOut, Cpu, BookOpen } from 'lucide-react'
import { useLogout, useAuthStore } from '@shared'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/workspace', icon: Cpu, label: 'Hardware Designer' },
  { href: '/academy', icon: BookOpen, label: 'Academy' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Schemo">
              <Link href="/">
                <Cpu className="size-4 shrink-0" />
                <span className="font-semibold">Schemo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ href, icon: Icon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={pathname === href} tooltip={label}>
                <Link href={href}>
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={user.email} disabled>
                <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium shrink-0">
                  {user.email[0].toUpperCase()}
                </span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              disabled={isPending}
              tooltip={isPending ? 'Logging out…' : 'Log out'}
            >
              <LogOut className="size-4 shrink-0" />
              <span>{isPending ? 'Logging out…' : 'Log out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
