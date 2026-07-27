import { createContext, useContext, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

const AuthContext = createContext({
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return (
    <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
