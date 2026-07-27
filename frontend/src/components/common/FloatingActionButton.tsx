import { PenSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RefObject } from 'react'
import { usePostStore } from '@/store/postStore'
import { useAuthStore } from '@/store/authStore'
import { useMagnetic } from '@/hooks/useMagnetic'

export function FloatingActionButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setCreateOpen = usePostStore((s) => s.setCreateOpen)
  const magnetic = useMagnetic(0.25)

  if (!isAuthenticated) return null

  return (
    <motion.button
      ref={magnetic.ref as RefObject<HTMLButtonElement>}
      style={magnetic.style}
      {...magnetic.handlers}
      type="button"
      onClick={() => setCreateOpen(true)}
      aria-label="Create a post"
      className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-warm text-white shadow-[0_16px_40px_rgb(15_159_138_/_0.4)] sm:hidden"
      whileTap={{ scale: 0.92 }}
    >
      <PenSquare className="h-5 w-5" />
    </motion.button>
  )
}
