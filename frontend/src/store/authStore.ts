import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'
import { authService } from '@/services/authService'

let bootstrapPromise: Promise<void> | null = null

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  isLoading: boolean
  setSession: (user: AuthUser) => void
  clearSession: () => void
  setHydrated: (v: boolean) => void
  setLoading: (v: boolean) => void
  bootstrap: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: true,

      setSession: (user) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },

      clearSession: () => {
        // Remove a token left by legacy versions; new sessions use an httpOnly cookie.
        set({ user: null, isAuthenticated: false, isLoading: false })
      },

      setHydrated: (v) => set({ isHydrated: v }),
      setLoading: (v) => set({ isLoading: v }),

      bootstrap: async () => {
        if (bootstrapPromise) return bootstrapPromise

        set({ isLoading: true })
        bootstrapPromise = (async () => {
          try {
            await authService.initializeCsrf()
            const user = await authService.refetch()
            set({ user, isAuthenticated: true, isLoading: false, isHydrated: true })
          } catch {
            // A 401 here is expected for a new visitor; route guards wait for
            // bootstrap rather than treating it as an application error.
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isHydrated: true,
            })
          } finally {
            bootstrapPromise = null
          }
        })()

        return bootstrapPromise
      },

      logout: async () => {
        await authService.logout()
        get().clearSession()
      },
    }),
    {
      name: 'aura-auth',
      partialize: () => ({}),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
