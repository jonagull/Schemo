'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@shared'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setLoading } = useAuthStore()

  useEffect(() => {
    // Check if we have persisted auth state
    const hasPersistedAuth = localStorage.getItem('auth-storage')

    if (hasPersistedAuth) {
      try {
        const parsed = JSON.parse(hasPersistedAuth)
        const state = parsed?.state

        // If we have a user and expiresAt in persisted state, we're authenticated
        if (state?.user && state?.expiresAt) {
          const expiresAt = new Date(state.expiresAt)
          const now = new Date()

          // Check if token is still valid
          if (now < expiresAt) {
            // Token is still valid, keep authenticated state
            setLoading(false)
          } else {
            // Token expired, clear auth state
            useAuthStore.getState().logout()
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [setLoading])

  return <>{children}</>
}
