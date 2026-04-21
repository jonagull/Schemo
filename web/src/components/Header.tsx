'use client'

import { useLogout, useUser, useAuthStore } from '@shared'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { isLoading: isLoadingUser } = useUser()

  const loading = isLoading || isLoadingUser

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              App
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/docs" className="gap-1.5">
                  Docs
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    Dev
                  </Badge>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/structure" className="gap-1.5">
                  Structure
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    Dev
                  </Badge>
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
                <Button variant="outline" size="sm" onClick={() => logout()} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
