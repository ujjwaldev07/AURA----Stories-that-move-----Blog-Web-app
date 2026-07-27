import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover, onClick }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn(
        'glass rounded-3xl shadow-[var(--shadow-soft)]',
        hover && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
