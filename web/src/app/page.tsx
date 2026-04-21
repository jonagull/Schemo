'use client'

import { useAuthCheck } from '@shared'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  useAuthCheck()

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">App</h1>
        <p className="text-muted-foreground text-lg">Your starting point. Start building your features.</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild size="sm">
            <Link href="/workspace">Open Hardware Designer</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
