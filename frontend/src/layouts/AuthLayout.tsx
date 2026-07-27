import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { PageTransition } from '@/components/common/PageTransition'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--mesh-1),transparent_55%),radial-gradient(ellipse_at_bottom_right,var(--mesh-2),transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--mesh-3),transparent_55%)]" />
      <motion.div
        className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-accent/25 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-16 h-96 w-96 rounded-full bg-warm/20 blur-3xl"
        animate={{ x: [0, -30, 20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--mesh-3)_80%,white)] blur-3xl opacity-70"
        animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--bg)_92%)]" />
    </div>
  )
}

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuroraBackground />
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Link
          to={ROUTES.landing}
          className="mb-8 flex items-center justify-center gap-2 focus-visible:outline-none"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink shadow-lg">
            <span className="h-3 w-3 rounded-full bg-accent shadow-[0_0_16px_var(--accent)]" />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">{env.appName}</span>
        </Link>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </div>
    </div>
  )
}
