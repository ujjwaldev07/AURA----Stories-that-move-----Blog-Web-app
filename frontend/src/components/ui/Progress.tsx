import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ProgressProps {
  value: number
  className?: string
  label?: string
}

export function Progress({ value, className, label }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-warm"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
