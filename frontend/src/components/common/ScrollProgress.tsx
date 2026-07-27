import { motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'

export function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-0.5 bg-transparent">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-accent via-warm to-accent"
        style={{ scaleX: progress }}
      />
    </div>
  )
}
