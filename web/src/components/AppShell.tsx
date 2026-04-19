'use client'

import { useAuthStore } from '@shared'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="flex flex-1" />
  }

  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </>
  )
}
