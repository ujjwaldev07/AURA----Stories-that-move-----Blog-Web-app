import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ProtectedRoute, GuestRoute } from '@/components/common/ProtectedRoute'
import { MainLayout } from '@/layouts/MainLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { FeedSkeleton } from '@/components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const FeedPage = lazy(() => import('@/pages/FeedPage'))
const ExplorePage = lazy(() => import('@/pages/ExplorePage'))
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const NotFoundPage = lazy(() => import('@/pages/ErrorPages'))
const ServerErrorPage = lazy(() =>
  import('@/pages/ErrorPages').then((m) => ({ default: m.ServerErrorPage })),
)
const OfflinePage = lazy(() =>
  import('@/pages/ErrorPages').then((m) => ({ default: m.OfflinePage })),
)

function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  useEffect(() => {
    const onUnauthorized = () => useAuthStore.getState().clearSession()
    window.addEventListener('aura:unauthorized', onUnauthorized)
    return () => window.removeEventListener('aura:unauthorized', onUnauthorized)
  }, [])

  return children
}

function RouteFallback() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <FeedSkeleton />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthBootstrap>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path={ROUTES.landing} element={<LandingPage />} />

                <Route element={<GuestRoute />}>
                  <Route element={<AuthLayout />}>
                    <Route path={ROUTES.login} element={<LoginPage />} />
                    <Route path={ROUTES.register} element={<RegisterPage />} />
                    <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path={ROUTES.feed} element={<FeedPage />} />
                    <Route path={ROUTES.explore} element={<ExplorePage />} />
                    <Route path={ROUTES.search} element={<SearchPage />} />
                    <Route path="/post/:id" element={<PostDetailPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path={ROUTES.editProfile} element={<EditProfilePage />} />
                  </Route>
                </Route>

                <Route path={ROUTES.serverError} element={<ServerErrorPage />} />
                <Route path={ROUTES.offline} element={<OfflinePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthBootstrap>
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'glass !rounded-2xl !bg-[var(--surface)] !text-[var(--ink)] !shadow-lg',
            duration: 3200,
            success: { iconTheme: { primary: 'var(--success)', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'white' } },
          }}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
