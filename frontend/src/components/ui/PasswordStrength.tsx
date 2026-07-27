import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  checks: {
    length: boolean
    letter: boolean
    number: boolean
    special: boolean
  }
}

export function evaluatePassword(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  let score = 0
  if (password.length >= 6) score += 1
  if (checks.length) score += 1
  if (checks.letter && checks.number) score += 1
  if (checks.special) score += 1

  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const

  return {
    score: score as PasswordStrengthResult['score'],
    label: password ? labels[score] : '',
    checks,
  }
}

const barColors = [
  'bg-danger',
  'bg-danger',
  'bg-warm',
  'bg-accent',
  'bg-success',
]

interface PasswordStrengthProps {
  password: string
  className?: string
}

export const PasswordStrength = memo(function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const result = useMemo(() => evaluatePassword(password), [password])

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)} aria-live="polite">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className={cn('h-full rounded-full', barColors[result.score])}
              initial={{ width: 0 }}
              animate={{ width: i < result.score ? '100%' : '0%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Strength: <span className="font-medium text-ink">{result.label}</span>
        </p>
        <ul className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-[10px] text-muted">
          <li className={result.checks.length ? 'text-success' : undefined}>8+ chars</li>
          <li className={result.checks.letter ? 'text-success' : undefined}>Letter</li>
          <li className={result.checks.number ? 'text-success' : undefined}>Number</li>
        </ul>
      </div>
    </div>
  )
})
