import { AnimatePresence, motion } from 'framer-motion'
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const online = useOnlineStatus()

  return (
    <AnimatePresence>
      {!online ? (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-3 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-danger px-4 py-2 text-sm text-white shadow-lg"
          role="status"
        >
          <WifiOff className="h-4 w-4" />
          You&apos;re offline — some actions may fail
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
