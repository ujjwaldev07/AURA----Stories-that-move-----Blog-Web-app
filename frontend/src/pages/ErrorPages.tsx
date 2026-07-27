import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-8xl font-extrabold gradient-text"
      >
        404
      </motion.p>
      <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        This route drifted into the void. Let’s get you back somewhere familiar.
      </p>
      <Link to={ROUTES.landing} className="mt-6">
        <Button>
          <Home className="h-4 w-4" />
          Go home
        </Button>
      </Link>
    </div>
  )
}

export function ServerErrorPage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-extrabold text-danger">500</p>
      <h1 className="mt-4 font-display text-2xl font-bold">Server error</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Something broke on the way. Retry in a moment.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}

export function OfflinePage() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <WifiOff className="mb-4 h-10 w-10 text-muted" />
      <h1 className="font-display text-3xl font-bold">You’re offline</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Reconnect to the network to load stories and publish again.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}
