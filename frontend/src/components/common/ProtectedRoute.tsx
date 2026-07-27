import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import { FeedSkeleton } from '@/components/ui/Skeleton'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isHydrated } = useAuthStore()
  const location = useLocation()

  if (!isHydrated || isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <FeedSkeleton />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isLoading, isHydrated } = useAuthStore()

  if (!isHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.feed} replace />
  }

  return <Outlet />
}
