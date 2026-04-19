'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LogOut } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { mutate: logout, isPending } = useLogout()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <span className="font-semibold">App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map(({ href, icon: Icon, label }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={pathname === href}>
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 px-1 pb-1">
              {user && (
                <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => logout()}
                disabled={isPending}
              >
                <LogOut className="size-4" />
                {isPending ? 'Logging out...' : 'Log out'}
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
