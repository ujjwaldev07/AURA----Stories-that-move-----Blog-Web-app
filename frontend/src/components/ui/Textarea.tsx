import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  maxCount?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, maxCount, value, id, ...props }, ref) => {
    const length = typeof value === 'string' ? value.length : 0
    const inputId = id || props.name

    return (
      <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
        {label ? <span className="text-sm font-medium text-ink/90">{label}</span> : null}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          aria-invalid={!!error}
          className={cn(
            'min-h-28 w-full resize-y rounded-2xl border bg-surface px-4 py-3 text-ink outline-none transition-all placeholder:text-muted/70',
            'focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)]',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-3">
          <AnimatePresence>
            {error ? (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-danger"
                role="alert"
              >
                {error}
              </motion.span>
            ) : (
              <span />
            )}
          </AnimatePresence>
          {typeof maxCount === 'number' ? (
            <span
              className={cn(
                'text-xs tabular-nums',
                length > maxCount ? 'text-danger' : 'text-muted',
              )}
            >
              {length}/{maxCount}
            </span>
          ) : null}
        </div>
      </label>
    )
  },
)

Textarea.displayName = 'Textarea'
