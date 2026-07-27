import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { ROUTES } from '@/constants/routes'
import { getErrorMessage } from '@/utils/errors'
import type { GoogleLoginPayload, LoginPayload, RegisterPayload } from '@/services/authService'

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, setSession, logout, bootstrap } = useAuthStore()
  const inflight = useRef(false)

  const login = useCallback(
    async (payload: LoginPayload) => {
      if (inflight.current) return
      inflight.current = true
      try {
        const result = await authService.login(payload)
        setSession(result.user)
        toast.success('Welcome back')
        navigate(ROUTES.feed)
      } finally {
        inflight.current = false
      }
    },
    [navigate, setSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      if (inflight.current) return
      inflight.current = true
      try {
        const { user: created } = await authService.register(payload)
        setSession(created)
        toast.success('Account created')
        navigate(ROUTES.feed)
      } finally {
        inflight.current = false
      }
    },
    [navigate, setSession],
  )

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => {
      if (inflight.current) return
      inflight.current = true
      try {
        const result = await authService.loginWithGoogle(payload)
        setSession(result.user)
        toast.success('Signed in with Google')
        navigate(ROUTES.feed)
      } finally {
        inflight.current = false
      }
    },
    [navigate, setSession],
  )

  const signOut = useCallback(async () => {
    try {
      await logout()
      toast.success('Signed out')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Signed out locally'))
      useAuthStore.getState().clearSession()
    }
    navigate(ROUTES.landing)
  }, [logout, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    signOut,
    bootstrap,
  }
}
