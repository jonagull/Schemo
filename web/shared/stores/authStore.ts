import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from '@shared'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  expiresAt: Date | null

  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setExpiresAt: (expiresAt: Date | string | null) => void
  logout: () => void
  checkTokenExpiry: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        expiresAt: null,

        setUser: user => set({ user, isAuthenticated: !!user }),

        setAuthenticated: isAuthenticated => set({ isAuthenticated }),

        setLoading: isLoading => set({ isLoading }),

        setExpiresAt: expiresAt => {
          const date = expiresAt ? (typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt) : null
          set({ expiresAt: date })
        },

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            expiresAt: null,
          }),

        checkTokenExpiry: () => {
          const { expiresAt } = get()
          if (!expiresAt) return true

          const now = new Date()
          const bufferTime = 60 * 1000
          const expiresAtDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
          return now.getTime() > expiresAtDate.getTime() - bufferTime
        },
      }),
      {
        name: 'auth-storage',
        partialize: state => ({
          user: state.user,
          expiresAt: state.expiresAt,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)
