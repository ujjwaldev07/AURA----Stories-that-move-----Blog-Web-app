import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Compass,
  Home,
  LogOut,
  Menu,
  PenSquare,
  Search,
  User,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { usePostStore } from '@/store/postStore'
import { useSearchStore } from '@/store/searchStore'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/cn'
import { env } from '@/config/env'

const nav = [
  { to: ROUTES.feed, label: 'Home', icon: Home },
  { to: ROUTES.explore, label: 'Explore', icon: Compass },
  { to: ROUTES.search, label: 'Search', icon: Search },
]

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const setCreateOpen = usePostStore((s) => s.setCreateOpen)
  const setSearchOpen = useSearchStore((s) => s.setOpen)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate(ROUTES.landing)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[color-mix(in_oklab,var(--bg)_75%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to={isAuthenticated ? ROUTES.feed : ROUTES.landing} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-accent">
            <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">{env.appName}</span>
        </Link>

        {isAuthenticated ? (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
                <PenSquare className="h-4 w-4" />
                Create
              </Button>
              <Link
                to={ROUTES.profile(user?.id || '')}
                className="hidden rounded-full sm:block"
                aria-label="Your profile"
              >
                <Avatar src={user?.avatar} name={user?.username} size="sm" ring />
              </Link>
              <Button size="icon" variant="ghost" onClick={onLogout} aria-label="Log out" className="hidden md:inline-flex">
                <LogOut className="h-4 w-4" />
              </Button>
              <button
                type="button"
                className="rounded-2xl p-2 md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.login}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.register}>
                <Button size="sm">Join free</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="glass absolute top-0 right-0 flex h-full w-[82%] max-w-sm flex-col gap-2 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-surface-2"
                >
                  <item.icon className="h-5 w-5 text-accent" />
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-surface-2"
                onClick={() => {
                  setCreateOpen(true)
                  setMobileOpen(false)
                }}
              >
                <PenSquare className="h-5 w-5 text-accent" />
                Create post
              </button>
              <Link
                to={ROUTES.profile(user?.id || '')}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-surface-2"
              >
                <User className="h-5 w-5 text-accent" />
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  void onLogout()
                }}
                className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-3 text-danger hover:bg-danger/10"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
