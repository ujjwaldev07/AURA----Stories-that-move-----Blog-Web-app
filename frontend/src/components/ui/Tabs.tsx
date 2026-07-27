import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface TabsProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn('relative flex gap-1 rounded-2xl bg-surface-2 p-1', className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 -z-10 rounded-xl bg-surface shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : null}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
